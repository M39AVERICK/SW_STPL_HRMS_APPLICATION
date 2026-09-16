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

        AttendanceService.validate_attendance(
            self.instance,
            data
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