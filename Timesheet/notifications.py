from django.contrib.auth import get_user_model

from .models import TimesheetNotification


def notify_timesheet_stakeholders(revision, stage):
    """Create in-app notifications for the next people responsible for a timesheet."""
    assignment = revision.period.assignment
    employee = revision.period.employee
    recipients = set()
    event = "Timesheet update"
    message = "A timesheet was updated."
    user_model = get_user_model()

    hr_admin_ids = set(
        user_model.objects.filter(role__in=["admin", "hr"], is_active=True)
        .values_list("id", flat=True)
    )
    if stage == "submitted":
        recipients.add(assignment.approver_id)
        recipients.update(hr_admin_ids)
        event = "Timesheet submitted"
        message = f"{employee.full_name} submitted a timesheet for {assignment.project.name}; approver review is needed."
    elif stage == "approver_review":
        if revision.status == revision.Status.FINANCE_PENDING:
            recipients.update(user_model.objects.filter(role="finance", is_active=True).values_list("id", flat=True))
            recipients.update(hr_admin_ids)
            if employee.user_id:
                recipients.add(employee.user_id)
            message = f"{employee.full_name}'s timesheet for {assignment.project.name} was approved by the project approver and sent to Finance."
            event = "Approved and sent to Finance"
        else:
            if employee.user_id:
                recipients.add(employee.user_id)
            message = f"Changes were requested on your timesheet for {assignment.project.name}. Please review the approver's comment."
            event = "Changes requested"
    elif stage == "finance_processed":
        if employee.user_id:
            recipients.add(employee.user_id)
        recipients.add(assignment.approver_id)
        recipients.update(hr_admin_ids)
        message = f"Finance processed {employee.full_name}'s timesheet for {assignment.project.name}."
        event = "Finance processed"

    TimesheetNotification.objects.bulk_create([
        TimesheetNotification(
            recipient_id=recipient_id,
            revision=revision,
            event=event,
            message=message[:240],
        )
        for recipient_id in recipients
    ])
