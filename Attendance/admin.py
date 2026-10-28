from django import forms
from django.contrib import admin
from django.db import transaction
from rest_framework.exceptions import ValidationError as APIValidationError

from .models import Attendance, Shift
from .notifications import create_attendance_notifications
from .services import AttendanceService


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ("name", "start_time", "end_time", "grace_minutes", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


class AttendanceAdminForm(forms.ModelForm):
    class Meta:
        model = Attendance
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()
        instance = self.instance if self.instance.pk else None
        try:
            AttendanceService.validate_attendance(instance, cleaned_data)
        except APIValidationError as exc:
            raise forms.ValidationError(exc.detail) from exc
        return cleaned_data


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    form = AttendanceAdminForm

    list_display = (
        "employee",
        "attendance_date",
        "check_in",
        "check_out",
        "status",
        "shift",
        "working_hours",
        "late_minutes",
        "early_leave_minutes",
        "overtime_minutes",
    )
    list_filter = ("status", "shift", "attendance_date")
    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "employee__employee_id",
    )
    ordering = ("-attendance_date",)
    readonly_fields = (
        "working_hours",
        "late_minutes",
        "early_leave_minutes",
        "overtime_minutes",
        "is_late",
        "is_early_leave",
        "is_overtime",
        "is_half_day",
        "created_at",
        "updated_at",
    )

    def save_model(self, request, obj, form, change):
        was_checked_out = obj.check_out is not None if change else False
        instance = obj if change else None
        values = AttendanceService.process_attendance(
            form.cleaned_data,
            instance=instance,
        )
        calculated_fields = (
            "working_hours",
            "late_minutes",
            "early_leave_minutes",
            "overtime_minutes",
            "is_late",
            "is_early_leave",
            "is_overtime",
            "is_half_day",
        )
        for field in calculated_fields:
            setattr(obj, field, values[field])
        super().save_model(request, obj, form, change)
        if not change or (not was_checked_out and obj.check_out is not None):
            event = "Attendance recorded" if obj.check_out else "Check-in recorded"
            transaction.on_commit(
                lambda: create_attendance_notifications(obj, event)
            )
