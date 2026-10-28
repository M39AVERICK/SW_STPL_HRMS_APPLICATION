from django.core.exceptions import ValidationError
from django.conf import settings
from django.db import models
from django.db.models import Q

from HR_APP.models import Employee


class Shift(models.Model):
    class Name(models.TextChoices):
        MORNING = "Morning", "Morning"
        GENERAL = "General", "General"
        CUSTOM = "Custom", "Custom"

    name = models.CharField(max_length=20, choices=Name.choices, unique=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    grace_minutes = models.PositiveSmallIntegerField(default=15)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = "Present", "Present"
        ABSENT = "Absent", "Absent"
        HALF_DAY = "Half Day", "Half Day"
        LEAVE = "Leave", "Leave"
        HOLIDAY = "Holiday", "Holiday"
        WEEKEND = "Weekend", "Weekend"
        WORK_FROM_HOME = "Work From Home", "Work From Home"

    class WorkLocation(models.TextChoices):
        OFFICE = "Office", "Office"
        CLIENT_SITE = "Client Site", "Client Site"
        REMOTE = "Remote", "Remote"

    employee = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        related_name="attendance_records",
    )
    attendance_date = models.DateField()
    work_location = models.CharField(
        max_length=20,
        choices=WorkLocation.choices,
        default=WorkLocation.OFFICE,
    )
    project_assignment = models.ForeignKey(
        "Timesheet.EmployeeProjectAssignment",
        on_delete=models.PROTECT,
        related_name="attendance_records",
        null=True,
        blank=True,
    )
    shift = models.ForeignKey(
        Shift,
        on_delete=models.PROTECT,
        related_name="attendance_records",
        null=True,
        blank=True,
    )

    # Use timezone-aware datetimes so overnight shifts are represented correctly.
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PRESENT,
    )
    remarks = models.TextField(blank=True, null=True)

    working_hours = models.DurationField(null=True, blank=True)
    late_minutes = models.PositiveIntegerField(default=0)
    early_leave_minutes = models.PositiveIntegerField(default=0)
    overtime_minutes = models.PositiveIntegerField(default=0)
    is_late = models.BooleanField(default=False)
    is_early_leave = models.BooleanField(default=False)
    is_overtime = models.BooleanField(default=False)
    is_half_day = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-attendance_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "attendance_date"],
                name="unique_employee_attendance",
            ),
            models.CheckConstraint(
                condition=(
                    Q(check_in__isnull=True)
                    | Q(check_out__isnull=True)
                    | Q(check_out__gte=models.F("check_in"))
                ),
                name="attendance_checkout_after_checkin",
            ),
        ]
        indexes = [
            models.Index(fields=["attendance_date", "status"]),
        ]

    def clean(self):
        super().clean()

        if self.check_in and self.check_out and self.check_out < self.check_in:
            raise ValidationError({"check_out": "Check-out must be after check-in."})

        if self.work_location == self.WorkLocation.CLIENT_SITE:
            if not self.project_assignment_id:
                raise ValidationError({
                    "project_assignment": "Select the employee's client project assignment."
                })
            assignment = self.project_assignment
            if self.employee_id and assignment.employee_id != self.employee_id:
                raise ValidationError({
                    "project_assignment": "This assignment belongs to another employee."
                })
            if self.attendance_date is None:
                raise ValidationError({
                    "attendance_date": "Enter an attendance date for this client-site record."
                })
            if assignment.start_date and self.attendance_date < assignment.start_date:
                raise ValidationError({
                    "attendance_date": "The assignment had not started on this date."
                })
            if assignment.end_date and self.attendance_date > assignment.end_date:
                raise ValidationError({
                    "attendance_date": "The assignment had ended on this date."
                })
        elif self.project_assignment_id:
            raise ValidationError({
                "project_assignment": "A project assignment is only used for client-site attendance."
            })

        no_punch_statuses = {
            self.Status.ABSENT,
            self.Status.LEAVE,
            self.Status.HOLIDAY,
            self.Status.WEEKEND,
        }
        if self.status in no_punch_statuses and (self.check_in or self.check_out):
            raise ValidationError(
                "Absent, leave, holiday, and weekend records should not have punches."
            )

    def __str__(self):
        return f"{self.employee.employee_id} | {self.attendance_date}"


class AttendanceNotification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attendance_notifications",
    )
    attendance = models.ForeignKey(
        Attendance,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    event = models.CharField(max_length=40)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event}: {self.attendance}"


