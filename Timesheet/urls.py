from django.urls import path

from .views import (
    EmployeeAssignmentListView,
    EmployeeAssignmentDetailView,
    ClientListCreateView,
    ClientDetailView,
    ProjectListCreateView,
    ProjectDetailView,
    TimesheetApproverListView,
    TimesheetAccessUserListView,
    TimesheetNotificationListView,
    TimesheetFinanceQueueView,
    TimesheetApprovalQueueView,
    TimesheetAttachmentListCreateView,
    TimesheetAttachmentDownloadView,
    TimesheetEntryListCreateView,
    TimesheetPeriodDetailView,
    TimesheetPeriodListCreateView,
    TimesheetReviewView,
    TimesheetStartRevisionView,
    TimesheetSubmitView,
)

app_name = "timesheet"

urlpatterns = [
    path("clients/", ClientListCreateView.as_view(), name="client-list-create"),
    path("clients/<int:client_id>/", ClientDetailView.as_view(), name="client-detail"),
    path("projects/", ProjectListCreateView.as_view(), name="project-list-create"),
    path("projects/<int:project_id>/", ProjectDetailView.as_view(), name="project-detail"),
    path("approvers/", TimesheetApproverListView.as_view(), name="approver-list"),
    path("access-users/", TimesheetAccessUserListView.as_view(), name="access-users"),
    path("notifications/", TimesheetNotificationListView.as_view(), name="notifications"),
    path("assignments/", EmployeeAssignmentListView.as_view(), name="assignment-list"),
    path("assignments/<int:assignment_id>/", EmployeeAssignmentDetailView.as_view(), name="assignment-detail"),
    path("periods/", TimesheetPeriodListCreateView.as_view(), name="period-list-create"),
    path("periods/<int:period_id>/", TimesheetPeriodDetailView.as_view(), name="period-detail"),
    path("periods/<int:period_id>/start-revision/", TimesheetStartRevisionView.as_view(), name="start-revision"),
    path("periods/<int:period_id>/entries/", TimesheetEntryListCreateView.as_view(), name="entries"),
    path("periods/<int:period_id>/attachments/", TimesheetAttachmentListCreateView.as_view(), name="attachments"),
    path("attachments/<int:attachment_id>/download/", TimesheetAttachmentDownloadView.as_view(), name="attachment-download"),
    path("periods/<int:period_id>/submit/", TimesheetSubmitView.as_view(), name="submit"),
    path("approvals/", TimesheetApprovalQueueView.as_view(), name="approval-queue"),
    path("finance/", TimesheetFinanceQueueView.as_view(), name="finance-queue"),
    path("finance/<int:revision_id>/", TimesheetFinanceQueueView.as_view(), name="finance-process"),
    path("revisions/<int:revision_id>/review/", TimesheetReviewView.as_view(), name="review"),
]
