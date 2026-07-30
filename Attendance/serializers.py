from datetime import date

from rest_framework import serializers

from .models import Attendance, Shift
from .services import AttendanceService


# ==========================================================
# Shift Serializer
# ==========================================================

class ShiftSerializer(serializers.ModelSerializer):

    class Meta:
        model = Shift
        fields = "__all__"


# ==========================================================
# Attendance Serializer
# ==========================================================

class AttendanceSerializer(serializers.ModelSerializer):

    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = "__all__"

    # ------------------------------------------------------
    # Employee Full Name
    # ------------------------------------------------------
    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    # ------------------------------------------------------
    # Validations
    # ------------------------------------------------------
    def validate(self, data):

        employee = data.get(
            "employee",
            getattr(self.instance, "employee", None)
        )

        attendance_date = data.get(
            "attendance_date",
            getattr(self.instance, "attendance_date", None)
        )

        check_in = data.get(
            "check_in",
            getattr(self.instance, "check_in", None)
        )

        check_out = data.get(
            "check_out",
            getattr(self.instance, "check_out", None)
        )

        status = data.get(
            "status",
            getattr(self.instance, "status", None)
        )

        # -----------------------------------------------
        # Duplicate Attendance
        # -----------------------------------------------
        query = Attendance.objects.filter(
            employee=employee,
            attendance_date=attendance_date
        )

        if self.instance:
            query = query.exclude(pk=self.instance.pk)

        if query.exists():
            raise serializers.ValidationError(
                "Attendance already exists for this employee on this date."
            )

        # -----------------------------------------------
        # Future Date Validation
        # -----------------------------------------------
        if attendance_date and attendance_date > date.today():
            raise serializers.ValidationError(
                "Future attendance cannot be marked."
            )

        # -----------------------------------------------
        # Check Out Validation
        # -----------------------------------------------
        if check_in and check_out:

            if check_out <= check_in:

                raise serializers.ValidationError(
                    "Check Out must be later than Check In."
                )

        # -----------------------------------------------
        # Leave / Absent Validation
        # -----------------------------------------------
        if status in ["Absent", "Leave"]:

            if check_in or check_out:

                raise serializers.ValidationError(
                    "Absent/Leave records should not have Check In or Check Out."
                )

        return data

    # ------------------------------------------------------
    # Create Attendance
    # ------------------------------------------------------
    def create(self, validated_data):

        validated_data = AttendanceService.process_attendance(
            validated_data
        )

        return super().create(validated_data)

    # ------------------------------------------------------
    # Update Attendance
    # ------------------------------------------------------
    def update(self, instance, validated_data):

        validated_data["check_in"] = validated_data.get(
            "check_in",
            instance.check_in
        )

        validated_data["check_out"] = validated_data.get(
            "check_out",
            instance.check_out
        )

        validated_data["shift"] = validated_data.get(
            "shift",
            instance.shift
        )

        validated_data = AttendanceService.process_attendance(
            validated_data
        )

        return super().update(instance, validated_data)