from django.db import IntegrityError, transaction
from rest_framework import serializers

from HR_APP.models import Employee
from .models import Attendance, Shift
from .notifications import create_attendance_notifications
from .services import AttendanceService


HR_ADMIN_ROLES = {"admin", "hr"}


class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = [
            "id", "name", "start_time", "end_time", "grace_minutes",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    project_name = serializers.CharField(
        source="project_assignment.project.name", read_only=True, allow_null=True
    )
    client_name = serializers.CharField(
        source="project_assignment.project.client.name", read_only=True, allow_null=True
    )
    site_name = serializers.CharField(
        source="project_assignment.project.site_name", read_only=True, allow_null=True
    )

    class Meta:
        model = Attendance
        fields = [
            "id", "employee", "employee_name", "attendance_date",
            "work_location", "project_assignment", "project_name", "client_name",
            "site_name", "shift", "check_in", "check_out", "status", "remarks",
            "working_hours", "late_minutes", "early_leave_minutes",
            "overtime_minutes", "is_late", "is_early_leave", "is_overtime",
            "is_half_day", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "employee_name", "project_name", "client_name", "site_name",
            "working_hours", "late_minutes", "early_leave_minutes",
            "overtime_minutes", "is_late", "is_early_leave", "is_overtime",
            "is_half_day", "created_at", "updated_at",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and getattr(user, "role", None) not in HR_ADMIN_ROLES:
            fields["employee"].read_only = True
            fields["work_location"].read_only = True
            fields["status"].read_only = True
        return fields

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and getattr(user, "role", None) not in HR_ADMIN_ROLES:
            try:
                employee = Employee.objects.get(user=user)
            except Employee.DoesNotExist as exc:
                raise serializers.ValidationError(
                    "Your account is not linked to an employee record."
                ) from exc
            attrs["employee"] = employee
            if employee.attendance_category == Employee.AttendanceCategory.ON_SITE:
                attrs["work_location"] = Attendance.WorkLocation.CLIENT_SITE
            else:
                attrs["work_location"] = Attendance.WorkLocation.OFFICE
                attrs["project_assignment"] = None

        AttendanceService.validate_attendance(self.instance, attrs)
        return attrs

    def create(self, validated_data):
        validated_data = AttendanceService.process_attendance(validated_data)
        try:
            with transaction.atomic():
                attendance = super().create(validated_data)
                transaction.on_commit(
                    lambda: create_attendance_notifications(attendance, "Attendance recorded")
                )
                return attendance
        except IntegrityError as exc:
            raise serializers.ValidationError({
                "attendance_date": "Attendance already exists for this employee on this date."
            }) from exc

    def update(self, instance, validated_data):
        is_check_out = instance.check_out is None and validated_data.get("check_out") is not None
        validated_data = AttendanceService.process_attendance(
            validated_data,
            instance=instance,
        )
        try:
            with transaction.atomic():
                attendance = super().update(instance, validated_data)
                if is_check_out:
                    transaction.on_commit(
                        lambda: create_attendance_notifications(attendance, "Check-out recorded")
                    )
                return attendance
        except IntegrityError as exc:
            raise serializers.ValidationError({
                "attendance_date": "This change conflicts with an existing attendance record."
            }) from exc
