from datetime import timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.utils import timezone

from .models import TimesheetAttachment, TimesheetEntry, TimesheetPeriod, TimesheetRevision
from .notifications import notify_timesheet_stakeholders


class TimesheetService:
    @staticmethod
    def hours_to_minutes(value):
        """Convert decimal hours entered by a person to whole stored minutes."""
        try:
            hours = Decimal(str(value))
        except (InvalidOperation, TypeError, ValueError) as exc:
            raise ValidationError("Enter hours as a number, for example 8 or 2.5.") from exc

        if not hours.is_finite() or hours < 0 or hours > 24:
            raise ValidationError("Hours must be between 0 and 24 per day.")

        return int((hours * 60).quantize(Decimal("1"), rounding=ROUND_HALF_UP))

    @staticmethod
    def _copy_revision(source):
        revision = TimesheetRevision.objects.create(
            period=source.period,
            revision_number=source.revision_number + 1,
            employee_note=source.employee_note,
        )
        for entry in source.entries.all():
            TimesheetEntry.objects.create(
                revision=revision,
                work_date=entry.work_date,
                regular_minutes=entry.regular_minutes,
                extra_minutes=entry.extra_minutes,
                work_description=entry.work_description,
            )
        for attachment in source.attachments.all():
            TimesheetAttachment.objects.create(
                revision=revision,
                file=attachment.file.name,
                uploaded_by=attachment.uploaded_by,
            )
        return revision

    @staticmethod
    @transaction.atomic
    def get_or_create_draft(employee, assignment, week_start):
        """Get the editable draft for a Monday-starting week, creating it if needed."""
        if assignment.employee_id != employee.id:
            raise PermissionDenied("This project assignment belongs to another employee.")
        if week_start.weekday() != 0:
            raise ValidationError({"week_start": "The timesheet week must start on Monday."})
        if assignment.end_date and assignment.end_date < assignment.start_date:
            raise ValidationError("Assignment end date cannot be before its start date.")

        week_end = week_start + timedelta(days=6)
        assignment_end = assignment.end_date or week_end
        if assignment.start_date > week_end or assignment_end < week_start:
            raise ValidationError("The assignment was not active during this week.")

        period, _ = TimesheetPeriod.objects.get_or_create(
            employee=employee,
            assignment=assignment,
            week_start=week_start,
        )
        period = TimesheetPeriod.objects.select_for_update().get(pk=period.pk)
        latest = period.revisions.select_for_update().order_by("-revision_number").first()

        if latest is None:
            return TimesheetRevision.objects.create(period=period, revision_number=1)
        if latest.status == TimesheetRevision.Status.DRAFT:
            return latest
        if latest.status == TimesheetRevision.Status.SUBMITTED:
            raise ValidationError("This timesheet is waiting for approver review.")
        if latest.status == TimesheetRevision.Status.APPROVED:
            raise ValidationError("This approved timesheet is awaiting Finance. Contact HR if a correction is needed.")
        if latest.status == TimesheetRevision.Status.FINANCE_PENDING:
            raise ValidationError("HR has sent this timesheet to Finance. It cannot be changed while Finance processes it.")
        if latest.status == TimesheetRevision.Status.PROCESSED:
            raise ValidationError("This timesheet has been processed by Finance. Contact HR if a correction is needed.")

        # Returned submissions stay unchanged; edits happen in a new revision.
        return TimesheetService._copy_revision(latest)

    @staticmethod
    @transaction.atomic
    def start_correction(period):
        """Start a new revision after an approved or returned submission."""
        period = TimesheetPeriod.objects.select_for_update().get(pk=period.pk)
        latest = period.revisions.select_for_update().order_by("-revision_number").first()
        if latest is None or latest.status != TimesheetRevision.Status.CHANGES_REQUESTED:
            raise ValidationError("A correction can start only after review.")
        return TimesheetService._copy_revision(latest)

    @staticmethod
    @transaction.atomic
    def save_daily_entry(revision, work_date, regular_hours, extra_hours, work_description):
        revision = TimesheetRevision.objects.select_for_update().get(pk=revision.pk)
        if revision.status != TimesheetRevision.Status.DRAFT:
            raise ValidationError("Only a draft timesheet can be edited.")

        period = revision.period
        if not period.week_start <= work_date <= period.week_end:
            raise ValidationError({"work_date": "This date is outside the timesheet week."})
        if work_date > timezone.localdate():
            raise ValidationError({"work_date": "Future work dates cannot be submitted."})

        assignment = period.assignment
        if assignment.end_date and assignment.end_date < assignment.start_date:
            raise ValidationError("Assignment end date cannot be before its start date.")
        if work_date < assignment.start_date:
            raise ValidationError({"work_date": "The assignment had not started on this date."})
        if assignment.end_date and work_date > assignment.end_date:
            raise ValidationError({"work_date": "The assignment had ended on this date."})

        regular_minutes = TimesheetService.hours_to_minutes(regular_hours)
        extra_minutes = TimesheetService.hours_to_minutes(extra_hours)

        if work_date.weekday() >= 5 and regular_minutes:
            raise ValidationError({
                "regular_hours": "Saturday and Sunday hours must be entered as extra hours."
            })
        if work_date.weekday() < 5 and regular_minutes > assignment.expected_daily_minutes:
            raise ValidationError({
                "regular_hours": "Regular hours cannot exceed the expected weekday hours; "
                "enter additional time as extra hours."
            })
        if regular_minutes + extra_minutes > 24 * 60:
            raise ValidationError("A day's total hours cannot exceed 24.")
        if regular_minutes + extra_minutes == 0:
            raise ValidationError("Enter hours for a work entry.")

        description = (work_description or "").strip()
        if not description:
            raise ValidationError({"work_description": "Describe the work for this day."})

        entry, _ = TimesheetEntry.objects.update_or_create(
            revision=revision,
            work_date=work_date,
            defaults={
                "regular_minutes": regular_minutes,
                "extra_minutes": extra_minutes,
                "work_description": description,
            },
        )
        return entry

    @staticmethod
    @transaction.atomic
    def submit(revision):
        revision = TimesheetRevision.objects.select_for_update().get(pk=revision.pk)
        if revision.status != TimesheetRevision.Status.DRAFT:
            raise ValidationError("Only a draft timesheet can be submitted.")
        if not revision.entries.exists():
            raise ValidationError("Add at least one daily work entry before submitting.")
        if not revision.attachments.exists():
            raise ValidationError("Attach the weekly PDF before submitting.")

        revision.status = TimesheetRevision.Status.SUBMITTED
        revision.submitted_at = timezone.now()
        revision.save(update_fields=["status", "submitted_at"])
        return revision

    @staticmethod
    @transaction.atomic
    def review(revision, reviewer, decision, comment=""):
        revision = TimesheetRevision.objects.select_for_update().select_related(
            "period__assignment"
        ).get(pk=revision.pk)
        assignment = revision.period.assignment
        if assignment.approver_id != reviewer.id:
            raise PermissionDenied("You are not assigned to approve this timesheet.")
        if revision.status != TimesheetRevision.Status.SUBMITTED:
            raise ValidationError("Only submitted timesheets can be reviewed.")

        comment = (comment or "").strip()
        if decision == "approve":
            revision.status = TimesheetRevision.Status.FINANCE_PENDING
        elif decision == "request_changes":
            if not comment:
                raise ValidationError({"comment": "Give a reason for requesting changes."})
            revision.status = TimesheetRevision.Status.CHANGES_REQUESTED
        else:
            raise ValidationError({"decision": "Choose approve or request_changes."})

        revision.reviewed_by = reviewer
        revision.reviewed_at = timezone.now()
        revision.reviewer_comment = comment
        revision.save(update_fields=[
            "status", "reviewed_by", "reviewed_at", "reviewer_comment"
        ])
        notify_timesheet_stakeholders(revision, "approver_review")
        return revision

    @staticmethod
    @transaction.atomic
    def finance_process(revision, finance_user, reference=""):
        revision = TimesheetRevision.objects.select_for_update().select_related(
            "period__employee", "period__assignment__approver"
        ).get(pk=revision.pk)
        if getattr(finance_user, "role", None) != "finance":
            raise PermissionDenied("Only Finance can mark this timesheet processed.")
        if revision.status != TimesheetRevision.Status.FINANCE_PENDING:
            raise ValidationError("This timesheet has not been cleared by HR for Finance.")

        revision.status = TimesheetRevision.Status.PROCESSED
        revision.finance_processed_by = finance_user
        revision.finance_processed_at = timezone.now()
        revision.finance_reference = (reference or "").strip()
        revision.save(update_fields=[
            "status", "finance_processed_by", "finance_processed_at", "finance_reference"
        ])
        notify_timesheet_stakeholders(revision, "finance_processed")
        return revision
