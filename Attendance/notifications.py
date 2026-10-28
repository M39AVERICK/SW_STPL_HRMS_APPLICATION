from django.contrib.auth import get_user_model

from .models import AttendanceNotification


def create_attendance_notifications(attendance, event):
    """Create private in-app notifications for attendance stakeholders."""
    recipient_ids = set()
    employee = attendance.employee
    if employee.user_id:
        recipient_ids.add(employee.user_id)

    if attendance.project_assignment_id:
        recipient_ids.add(attendance.project_assignment.approver_id)
    else:
        user_model = get_user_model()
        recipient_ids.update(
            user_model.objects.filter(role__in=["admin", "hr"])
            .values_list("id", flat=True)
        )

    AttendanceNotification.objects.bulk_create([
        AttendanceNotification(
            recipient_id=recipient_id,
            attendance=attendance,
            event=event,
        )
        for recipient_id in recipient_ids
    ])
