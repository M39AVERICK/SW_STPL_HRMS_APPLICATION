from rest_framework.exceptions import ValidationError
from datetime import date
from .models import Attendance

class AttendanceService:

    @staticmethod
    def validate_duplicate(instance, data):

        employee = data.get("employee")
        attendance_date = data.get("attendance_date")

        query = Attendance.objects.filter(
            employee=employee,
            attendance_date=attendance_date
        )

        if instance:
            query = query.exclude(pk=instance.pk)

        if query.exists():
            raise ValidationError(
                "Attendance already exists for this employee on this date."
            )
    @staticmethod
    def validate_future_date(data):

        attendance_date = data.get("attendance_date")

        if attendance_date and attendance_date > date.today():

            raise ValidationError(
                "Future attendance cannot be marked."
            )
    @staticmethod
    def validate_check_times(data):

        check_in = data.get("check_in")
        check_out = data.get("check_out")

        if check_in and check_out:

            if check_out <= check_in:

                raise ValidationError(
                    "Check Out must be later than Check In."
                )
    @staticmethod
    def validate_status(data):

        status = data.get("status")

        check_in = data.get("check_in")
        check_out = data.get("check_out")

        if status in ["Absent", "Leave"]:

            if check_in or check_out:

                raise ValidationError(
                    "Absent/Leave cannot have Check In or Check Out."
                )
    @staticmethod
    def validate_attendance(instance, data):

        AttendanceService.validate_duplicate(
            instance,
            data
        )

        AttendanceService.validate_future_date(
            data
        )

        AttendanceService.validate_check_times(
            data
        )

        AttendanceService.validate_status(
            data
        )