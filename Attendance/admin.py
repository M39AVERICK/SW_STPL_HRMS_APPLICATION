from django.contrib import admin
from .models import Attendance,Shift


admin.site.register(Shift)
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):

    list_display = (
        "employee",
        "attendance_date",
        "check_in",
        "check_out",
        "status",
        "shift",
    )

    list_filter = (
        "status",
        "shift",
        "attendance_date",
    )

    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "employee__employee_id",
    )

    ordering = ("-attendance_date",)