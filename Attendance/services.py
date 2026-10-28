from datetime import datetime, timedelta
import math

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .models import Attendance


NO_PUNCH_STATUSES = {
    Attendance.Status.ABSENT,
    Attendance.Status.LEAVE,
    Attendance.Status.HOLIDAY,
    Attendance.Status.WEEKEND,
}


class AttendanceService:
    """Attendance validation and derived-value calculations."""

    @staticmethod
    def merged_values(instance, data):
        """Return submitted values combined with the saved record for PATCH."""
        values = {}
        if instance is not None:
            values = {
                "employee": instance.employee,
                "attendance_date": instance.attendance_date,
                "status": instance.status,
                "work_location": instance.work_location,
                "project_assignment": instance.project_assignment,
                "shift": instance.shift,
                "check_in": instance.check_in,
                "check_out": instance.check_out,
                "remarks": instance.remarks,
            }
        values.update(data)
        return values

    @staticmethod
    def validate_attendance(instance, data):
        values = AttendanceService.merged_values(instance, data)
        employee = values.get("employee")
        attendance_date = values.get("attendance_date")
        status = values.get("status")
        work_location = values.get("work_location", Attendance.WorkLocation.OFFICE)
        project_assignment = values.get("project_assignment")
        check_in = values.get("check_in")
        check_out = values.get("check_out")

        errors = {}
        if employee is None:
            errors["employee"] = "An employee is required."
        if attendance_date is None:
            errors["attendance_date"] = "An attendance date is required."
        elif attendance_date > timezone.localdate():
            errors["attendance_date"] = "Future attendance cannot be marked."

        if employee is not None and attendance_date is not None:
            duplicate = Attendance.objects.filter(
                employee=employee,
                attendance_date=attendance_date,
            )
            if instance is not None:
                duplicate = duplicate.exclude(pk=instance.pk)
            if duplicate.exists():
                errors["attendance_date"] = (
                    "Attendance already exists for this employee on this date."
                )

        if work_location == Attendance.WorkLocation.CLIENT_SITE:
            if project_assignment is None:
                errors["project_assignment"] = "Select the employee's client project assignment."
            elif employee is not None and project_assignment.employee_id != employee.id:
                errors["project_assignment"] = "This assignment belongs to another employee."
            elif attendance_date is not None:
                if attendance_date < project_assignment.start_date:
                    errors["attendance_date"] = "The assignment had not started on this date."
                elif project_assignment.end_date and attendance_date > project_assignment.end_date:
                    errors["attendance_date"] = "The assignment had ended on this date."
        elif project_assignment is not None:
            errors["project_assignment"] = (
                "A project assignment is only used for client-site attendance."
            )

        if check_in and check_out and check_out <= check_in:
            errors["check_out"] = "Check-out must be later than check-in."

        if attendance_date is not None:
            local_tz = timezone.get_current_timezone()
            if check_in and timezone.localtime(check_in, local_tz).date() != attendance_date:
                errors["check_in"] = (
                    "Check-in must fall on the attendance date in the configured timezone."
                )
            # A night-shift checkout may occur on the following local calendar day.
            if check_out and timezone.localtime(check_out, local_tz).date() not in {
                attendance_date,
                attendance_date + timedelta(days=1),
            }:
                errors["check_out"] = (
                    "Check-out must fall on the attendance date or the following day."
                )

        if status in NO_PUNCH_STATUSES and (check_in or check_out):
            errors["status"] = (
                "Absent, leave, holiday, and weekend records cannot have punches."
            )

        if errors:
            raise ValidationError(errors)

    @staticmethod
    def _shift_bounds(attendance_date, shift):
        """Build timezone-aware scheduled start/end datetimes, including night shifts."""
        tz = timezone.get_current_timezone()
        start_naive = datetime.combine(attendance_date, shift.start_time)
        end_date = attendance_date
        if shift.end_time <= shift.start_time:
            end_date += timedelta(days=1)
        end_naive = datetime.combine(end_date, shift.end_time)
        return (
            timezone.make_aware(start_naive, tz),
            timezone.make_aware(end_naive, tz),
        )

    @staticmethod
    def _whole_minutes_ceil(delta):
        return max(0, math.ceil(delta.total_seconds() / 60))

    @staticmethod
    def process_attendance(data, instance=None):
        """Merge PATCH values and recalculate derived attendance metrics.

        Working hours are elapsed time between punches. Break deductions and
        payroll rounding must be applied only after STPL's policy is confirmed.
        """
        values = AttendanceService.merged_values(instance, data)
        check_in = values.get("check_in")
        check_out = values.get("check_out")
        shift = values.get("shift")
        attendance_date = values.get("attendance_date")

        values["working_hours"] = (
            check_out - check_in if check_in and check_out else None
        )
        values["late_minutes"] = 0
        values["early_leave_minutes"] = 0
        values["overtime_minutes"] = 0
        values["is_late"] = False
        values["is_early_leave"] = False
        values["is_overtime"] = False
        values["is_half_day"] = values.get("status") == Attendance.Status.HALF_DAY

        if shift is None or attendance_date is None:
            return values

        scheduled_start, scheduled_end = AttendanceService._shift_bounds(
            attendance_date,
            shift,
        )
        grace_end = scheduled_start + timedelta(minutes=shift.grace_minutes)

        if check_in and check_in > grace_end:
            values["late_minutes"] = AttendanceService._whole_minutes_ceil(
                check_in - grace_end
            )
            values["is_late"] = values["late_minutes"] > 0

        if check_out and check_out < scheduled_end:
            values["early_leave_minutes"] = AttendanceService._whole_minutes_ceil(
                scheduled_end - check_out
            )
            values["is_early_leave"] = values["early_leave_minutes"] > 0
        elif check_out and check_out > scheduled_end:
            # This is a raw scheduled-overrun; HR/payroll approval rules may differ.
            values["overtime_minutes"] = int(
                (check_out - scheduled_end).total_seconds() // 60
            )
            values["is_overtime"] = values["overtime_minutes"] > 0

        return values



