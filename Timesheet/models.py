from datetime import timedelta

from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone

from HR_APP.models import Employee


class Client(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Project(models.Model):
    client = models.ForeignKey(
        Client,
        on_delete=models.PROTECT,
        related_name="projects",
    )
    name = models.CharField(max_length=150)
    site_name = models.CharField(max_length=150, blank=True)
    code = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["client", "code"],
                name="unique_project_code_per_client",
            )
        ]

    def __str__(self):
        return f"{self.client.name} — {self.name}"


class EmployeeProjectAssignment(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        related_name="project_assignments",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.PROTECT,
        related_name="employee_assignments",
    )
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="timesheets_to_approve",
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    expected_daily_minutes = models.PositiveSmallIntegerField(default=480)
    is_active = models.BooleanField(default=True)


class TimesheetPeriod(models.Model):
    """One employee's timesheet period for one project and week."""

    employee = models.ForeignKey(Employee, on_delete=models.PROTECT)
    assignment = models.ForeignKey(
        EmployeeProjectAssignment,
        on_delete=models.PROTECT,
    )
    week_start = models.DateField()  # Use Monday as the start of the week.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "assignment", "week_start"],
                name="unique_timesheet_period",
            )
        ]

    @property
    def week_end(self):
        return self.week_start + timedelta(days=6)


class TimesheetRevision(models.Model):
    class Status(models.TextChoices):
        DRAFT = "Draft", "Draft"
        SUBMITTED = "Submitted", "Submitted"
        APPROVED = "Approved", "Approved"
        CHANGES_REQUESTED = "Changes Requested", "Changes Requested"
        FINANCE_PENDING = "Finance Pending", "Finance Pending"
        PROCESSED = "Processed", "Processed"

    period = models.ForeignKey(
        TimesheetPeriod,
        on_delete=models.PROTECT,
        related_name="revisions",
    )
    revision_number = models.PositiveSmallIntegerField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    employee_note = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="reviewed_timesheets",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_comment = models.TextField(blank=True)
    hr_reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="hr_reviewed_timesheets",
    )
    hr_reviewed_at = models.DateTimeField(null=True, blank=True)
    hr_comment = models.TextField(blank=True)
    finance_processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="finance_processed_timesheets",
    )
    finance_processed_at = models.DateTimeField(null=True, blank=True)
    finance_reference = models.CharField(max_length=100, blank=True)
    payroll_days = models.PositiveSmallIntegerField(null=True, blank=True)
    payroll_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    payroll_note = models.TextField(blank=True)
    payroll_recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True,
        related_name="payroll_recorded_timesheets",
    )
    payroll_recorded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["period", "revision_number"],
                name="unique_timesheet_revision",
            )
        ]


class TimesheetEntry(models.Model):
    revision = models.ForeignKey(
        TimesheetRevision,
        on_delete=models.CASCADE,
        related_name="entries",
    )
    work_date = models.DateField()
    regular_minutes = models.PositiveSmallIntegerField(default=0)
    extra_minutes = models.PositiveSmallIntegerField(default=0)
    work_description = models.TextField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["revision", "work_date"],
                name="one_entry_per_day_per_revision",
            )
        ]


class TimesheetAttachment(models.Model):
    revision = models.ForeignKey(
        TimesheetRevision,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    file = models.FileField(
        upload_to="timesheets/",
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)


class TimesheetReminderLog(models.Model):
    assignment = models.ForeignKey(
        EmployeeProjectAssignment,
        on_delete=models.CASCADE,
        related_name="timesheet_reminders",
    )
    week_start = models.DateField()
    recipient_email = models.EmailField()
    sent_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["assignment", "week_start", "recipient_email"],
                name="unique_timesheet_reminder_recipient",
            )
        ]


class TimesheetNotification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="timesheet_notifications",
    )
    revision = models.ForeignKey(
        TimesheetRevision,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    event = models.CharField(max_length=60)
    message = models.CharField(max_length=240)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
