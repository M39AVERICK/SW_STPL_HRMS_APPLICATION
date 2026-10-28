from datetime import timedelta

from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from Timesheet.models import (
    EmployeeProjectAssignment,
    TimesheetPeriod,
    TimesheetReminderLog,
    TimesheetRevision,
)
from HR_APP.models import Employee


class Command(BaseCommand):
    help = "Email Saturday reminders to on-site employees and their project approvers."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List intended reminders without sending or recording them.",
        )

    def handle(self, *args, **options):
        today = timezone.localdate()
        if today.weekday() != 5:
            self.stdout.write(self.style.WARNING(
                f"Today is {today:%A}; weekly reminders are sent on Saturdays only."
            ))
            return

        if not settings.DEFAULT_FROM_EMAIL:
            self.stderr.write(self.style.ERROR(
                "Email is not configured: DEFAULT_FROM_EMAIL is empty."
            ))
            return

        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        assignments = EmployeeProjectAssignment.objects.filter(
            is_active=True,
            employee__is_active=True,
            employee__attendance_category=Employee.AttendanceCategory.ON_SITE,
            start_date__lte=today,
        ).filter(
            models_end_date_filter(week_start)
        ).select_related(
            "employee", "employee__user", "project__client", "approver"
        )

        sent = 0
        skipped = 0
        for assignment in assignments:
            period = TimesheetPeriod.objects.filter(
                employee=assignment.employee,
                assignment=assignment,
                week_start=week_start,
            ).first()
            latest = (
                period.revisions.order_by("-revision_number").first()
                if period else None
            )
            if latest and latest.status in {
                TimesheetRevision.Status.SUBMITTED,
                TimesheetRevision.Status.APPROVED,
                TimesheetRevision.Status.FINANCE_PENDING,
                TimesheetRevision.Status.PROCESSED,
            }:
                skipped += 1
                continue

            project = assignment.project
            employee = assignment.employee
            employee_subject = f"Saturday reminder: complete your timesheet for {project.name}"
            employee_message = (
                f"Hello {employee.full_name},\n\n"
                f"Please complete and submit your timesheet for {project.name} "
                f"({assignment.project.client.name}), for {week_start} to {today}.\n"
                "Include your daily work entries and the required weekly PDF attachment. "
                "You can continue it from the Timesheets page in the STPL HRMS portal.\n"
            )
            approver_subject = f"Timesheet reminder: {employee.full_name} · {project.name}"
            approver_message = (
                f"Hello,\n\n"
                f"{employee.full_name} ({employee.employee_id}) has not submitted the "
                f"timesheet for {project.name} ({assignment.project.client.name}), "
                f"covering {week_start} to {today}.\n"
                "The employee has been reminded to complete it in the STPL HRMS portal.\n"
            )

            recipients = [
                (employee.official_email, employee_subject, employee_message),
                (assignment.approver.email, approver_subject, approver_message),
            ]
            for email, subject, message in recipients:
                if not email:
                    skipped += 1
                    continue
                if TimesheetReminderLog.objects.filter(
                    assignment=assignment,
                    week_start=week_start,
                    recipient_email__iexact=email,
                ).exists():
                    skipped += 1
                    continue
                if options["dry_run"]:
                    self.stdout.write(f"Would remind {email} for {project.name} ({week_start}).")
                    continue

                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                TimesheetReminderLog.objects.create(
                    assignment=assignment,
                    week_start=week_start,
                    recipient_email=email,
                )
                sent += 1

        action = "would send" if options["dry_run"] else "sent"
        self.stdout.write(self.style.SUCCESS(
            f"{action.capitalize()} {sent} reminder(s); skipped {skipped}."
        ))


def models_end_date_filter(week_start):
    """Assignments with no end date or whose end date overlaps this week."""
    from django.db.models import Q

    return Q(end_date__isnull=True) | Q(end_date__gte=week_start)
