from django.db import models
from HR_APP.models import Employee


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

    SHIFT_CHOICES = [
        ("General", "General"),
        ("Morning", "Morning"),
        ("Evening", "Evening"),
        ("Night", "Night"),
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

    shift = models.CharField(
        max_length=20,
        choices=SHIFT_CHOICES,
        default="General"
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-attendance_date"]

        unique_together = ("employee", "attendance_date")

    def __str__(self):
        return f"{self.employee.first_name} - {self.attendance_date}"