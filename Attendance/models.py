from django.db import models
from HR_APP.models import Employee

class Shift(models.Model):

    SHIFT_CHOICES = [
        ("Morning", "Morning"),
        ("General", "General"),
        ("Night", "Night"),
    ]

    name = models.CharField(
        max_length=20,
        choices=SHIFT_CHOICES,
        unique=True
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    grace_minutes = models.PositiveIntegerField(default=15)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Attendance(models.Model):

    STATUS_CHOICES = [
        ("Present", "Present"),
        ("Absent", "Absent"),
        ("Half Day", "Half Day"),
        ("Leave", "Leave"),
        ("Holiday", "Holiday"),
        ("Weekend", "Weekend"),
        ("Work From Home", "Work From Home"),
    ]

    

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    attendance_date = models.DateField()

    check_in = models.TimeField(
        null=True,
        blank=True
    )

    check_out = models.TimeField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Present"
    )

    shift = models.ForeignKey(
    Shift,
    on_delete=models.PROTECT,
    related_name="attendance_records"
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )
    working_hours = models.DurationField(
    null=True,
    blank=True
    )

    

    

    late_minutes = models.PositiveIntegerField(
            default=0
    )

    is_late = models.BooleanField(
            default=False
    )
    
# Attendance Behaviour

    is_early_leave = models.BooleanField(default=False)
    early_leave_minutes = models.PositiveIntegerField(default=0)

    is_overtime = models.BooleanField(default=False)
    overtime_minutes = models.PositiveIntegerField(default=0)
    is_half_day = models.BooleanField(default=False)
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-attendance_date"]

        indexes = [
            models.Index(fields=["attendance_date"]),
            models.Index(fields=["employee"]),
            models.Index(fields=["status"]),
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["employee", "attendance_date"],
                name="unique_employee_attendance",
            )
        ]

    def __str__(self):
        return f"{self.employee.employee_id} | {self.employee.first_name} | {self.attendance_date}"