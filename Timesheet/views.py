from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models.deletion import ProtectedError
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from HR_APP.models import Employee
from .models import Client, EmployeeProjectAssignment, Project, TimesheetAttachment, TimesheetNotification, TimesheetPeriod, TimesheetRevision
from .serializers import (
    ClientSerializer,
    EmployeeProjectAssignmentSerializer,
    ProjectSerializer,
    TimesheetAttachmentSerializer,
    TimesheetEntrySerializer,
    TimesheetPeriodCreateSerializer,
    TimesheetPeriodSerializer,
    TimesheetReviewSerializer,
    TimesheetRevisionSerializer,
    TimesheetApproverSerializer,
    TimesheetAccessUserSerializer,
    TimesheetFinanceProcessSerializer,
)
from .services import TimesheetService


HR_ADMIN_ROLES = {"admin", "hr"}


def is_hr_or_admin(user):
    return getattr(user, "role", None) in HR_ADMIN_ROLES


def employee_for_user(user):
    try:
        return Employee.objects.get(user=user)
    except Employee.DoesNotExist as exc:
        raise PermissionDenied("Your login is not linked to an employee record.") from exc


def call_service(method, *args, **kwargs):
    try:
        return method(*args, **kwargs)
    except DjangoValidationError as exc:
        detail = getattr(exc, "message_dict", None) or exc.messages
        raise ValidationError(detail) from exc
    except DjangoPermissionDenied as exc:
        raise PermissionDenied(str(exc)) from exc


def latest_revision(period):
    return period.revisions.order_by("-revision_number").first()


def ensure_period_read_access(user, period):
    if is_hr_or_admin(user) or period.employee.user_id == user.pk:
        return
    latest = latest_revision(period)
    if latest and period.assignment.approver_id == user.pk and latest.status == TimesheetRevision.Status.SUBMITTED:
        return
    if getattr(user, "role", None) == "finance" and latest and latest.status in {
        TimesheetRevision.Status.FINANCE_PENDING,
        TimesheetRevision.Status.PROCESSED,
    }:
        return
    raise PermissionDenied("You cannot view this timesheet.")


def ensure_period_write_access(user, period):
    if is_hr_or_admin(user) or period.employee.user_id == user.pk:
        return
    raise PermissionDenied("You cannot edit this timesheet.")


def editable_revision(period):
    revision = latest_revision(period)
    if revision is None or revision.status != TimesheetRevision.Status.DRAFT:
        raise ValidationError("Start an editable revision before changing this timesheet.")
    return revision


class TimesheetPeriodListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if is_hr_or_admin(request.user):
            periods = TimesheetPeriod.objects.select_related(
                "employee", "assignment__project__client"
            ).order_by("-week_start")
        else:
            employee = employee_for_user(request.user)
            periods = TimesheetPeriod.objects.filter(employee=employee).select_related(
                "employee", "assignment__project__client"
            ).order_by("-week_start")
        return Response(TimesheetPeriodSerializer(periods, many=True).data)

    def post(self, request):
        serializer = TimesheetPeriodCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.validated_data["assignment"]
        week_start = serializer.validated_data["week_start"]

        requested_employee = serializer.validated_data.get("employee")
        if is_hr_or_admin(request.user):
            employee = requested_employee or assignment.employee
        else:
            employee = employee_for_user(request.user)
            if requested_employee and requested_employee.pk != employee.pk:
                raise PermissionDenied("You can create a timesheet only for yourself.")
            if employee.attendance_category != Employee.AttendanceCategory.ON_SITE:
                raise PermissionDenied("Timesheets are available only to employees categorized as On-site.")

        revision = call_service(
            TimesheetService.get_or_create_draft,
            employee,
            assignment,
            week_start,
        )
        return Response(
            TimesheetPeriodSerializer(revision.period).data,
            status=status.HTTP_200_OK,
        )


class EmployeeAssignmentListView(APIView):
    """Return assignments an employee may choose for on-site attendance."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        assignments = EmployeeProjectAssignment.objects.select_related(
            "employee", "project__client"
        )
        if getattr(request.user, "role", None) == "approver":
            assignments = assignments.filter(approver=request.user)
        elif not is_hr_or_admin(request.user):
            employee = employee_for_user(request.user)
            assignments = assignments.filter(employee=employee)
        return Response(EmployeeProjectAssignmentSerializer(assignments, many=True).data)

    def post(self, request):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can create project assignments.")
        serializer = EmployeeProjectAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        return Response(EmployeeProjectAssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)


class ClientListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can view clients.")
        clients = Client.objects.order_by("name")
        return Response(ClientSerializer(clients, many=True).data)

    def post(self, request):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage clients.")
        serializer = ClientSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client = serializer.save()
        return Response(ClientSerializer(client).data, status=status.HTTP_201_CREATED)


class ClientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, client_id):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage clients.")
        client = get_object_or_404(Client, pk=client_id)
        if request.data.get("is_active") is False and client.projects.filter(is_active=True).exists():
            raise ValidationError({"is_active": "Deactivate this client's active projects first."})
        serializer = ClientSerializer(client, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, client_id):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage clients.")
        client = get_object_or_404(Client, pk=client_id)
        try:
            client.delete()
        except ProtectedError as exc:
            raise ValidationError({"detail": "This client is used by a project. Deactivate it instead to preserve records."}) from exc
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can view projects.")
        projects = Project.objects.select_related("client").order_by("client__name", "name")
        return Response(ProjectSerializer(projects, many=True).data)

    def post(self, request):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage projects.")
        serializer = ProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, project_id):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage projects.")
        project = get_object_or_404(Project.objects.select_related("client"), pk=project_id)
        if request.data.get("is_active") is False and project.employee_assignments.filter(is_active=True).exists():
            raise ValidationError({"is_active": "Deactivate this project's active employee assignments first."})
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        return Response(ProjectSerializer(project).data)

    def delete(self, request, project_id):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage projects.")
        project = get_object_or_404(Project, pk=project_id)
        try:
            project.delete()
        except ProtectedError as exc:
            raise ValidationError({"detail": "This project is used by an employee assignment. Deactivate it instead to preserve records."}) from exc
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmployeeAssignmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, assignment_id):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage project assignments.")
        assignment = get_object_or_404(EmployeeProjectAssignment, pk=assignment_id)
        serializer = EmployeeProjectAssignmentSerializer(assignment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        return Response(EmployeeProjectAssignmentSerializer(assignment).data)

    def delete(self, request, assignment_id):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage project assignments.")
        assignment = get_object_or_404(EmployeeProjectAssignment, pk=assignment_id)
        try:
            assignment.delete()
        except ProtectedError as exc:
            raise ValidationError({"detail": "This assignment has attendance or timesheet history. Deactivate it instead to preserve records."}) from exc
        return Response(status=status.HTTP_204_NO_CONTENT)


class TimesheetApproverListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can view approver accounts.")
        from ACCOUNTS.models import CURRENT_USER

        approvers = CURRENT_USER.objects.filter(role__in=["admin", "hr", "approver"], is_active=True).order_by("name")
        return Response(TimesheetApproverSerializer(approvers, many=True).data)


class TimesheetAccessUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage user access.")
        from ACCOUNTS.models import CURRENT_USER

        users = CURRENT_USER.objects.filter(is_active=True).order_by("name")
        return Response(TimesheetAccessUserSerializer(users, many=True).data)

    def patch(self, request):
        if not is_hr_or_admin(request.user):
            raise PermissionDenied("Only HR or admin can manage user access.")
        from ACCOUNTS.models import CURRENT_USER

        user_id = request.data.get("user_id")
        role = request.data.get("role")
        allowed_roles = {choice[0] for choice in CURRENT_USER.ROLE_CHOICES}
        if role not in allowed_roles:
            raise ValidationError({"role": "Choose a valid account role."})
        if str(user_id) == str(request.user.pk):
            raise ValidationError({"user_id": "You cannot change your own account role here."})
        if role == "admin" and getattr(request.user, "role", None) != "admin":
            raise PermissionDenied("Only an admin can grant the admin role.")
        target = get_object_or_404(CURRENT_USER, pk=user_id, is_active=True)
        target.role = role
        target.save(update_fields=["role", "is_staff", "is_superuser", "updated_at"])
        return Response(TimesheetAccessUserSerializer(target).data)


class TimesheetNotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = TimesheetNotification.objects.filter(recipient=request.user).select_related(
            "revision__period__employee", "revision__period__assignment__project__client"
        )[:30]
        return Response([
            {
                "id": item.id,
                "event": item.event,
                "message": item.message,
                "is_read": item.is_read,
                "created_at": item.created_at,
                "revision_id": item.revision_id,
                "status": item.revision.status,
            }
            for item in notifications
        ])

    def post(self, request):
        updated = TimesheetNotification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"marked_read": updated})


class TimesheetPeriodDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, period_id):
        period = get_object_or_404(
            TimesheetPeriod.objects.select_related("employee", "assignment__project__client"),
            pk=period_id,
        )
        ensure_period_read_access(request.user, period)
        return Response(TimesheetPeriodSerializer(period).data)


class TimesheetStartRevisionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, period_id):
        period = get_object_or_404(
            TimesheetPeriod.objects.select_related("employee", "assignment"),
            pk=period_id,
        )
        ensure_period_write_access(request.user, period)
        revision = call_service(
            TimesheetService.get_or_create_draft,
            period.employee,
            period.assignment,
            period.week_start,
        )
        return Response(TimesheetRevisionSerializer(revision).data)


class TimesheetEntryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, period_id):
        period = get_object_or_404(TimesheetPeriod, pk=period_id)
        ensure_period_read_access(request.user, period)
        revision = latest_revision(period)
        if revision is None:
            return Response([])
        return Response(TimesheetEntrySerializer(revision.entries.all(), many=True).data)

    def post(self, request, period_id):
        period = get_object_or_404(TimesheetPeriod.objects.select_related("employee"), pk=period_id)
        ensure_period_write_access(request.user, period)
        revision = editable_revision(period)
        serializer = TimesheetEntrySerializer(
            data=request.data,
            context={"revision": revision, "request": request},
        )
        serializer.is_valid(raise_exception=True)
        entry = serializer.save()
        return Response(TimesheetEntrySerializer(entry).data, status=status.HTTP_201_CREATED)


class TimesheetAttachmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, period_id):
        period = get_object_or_404(TimesheetPeriod, pk=period_id)
        ensure_period_read_access(request.user, period)
        revision = latest_revision(period)
        if revision is None:
            return Response([])
        return Response(TimesheetAttachmentSerializer(revision.attachments.all(), many=True).data)

    def post(self, request, period_id):
        period = get_object_or_404(TimesheetPeriod.objects.select_related("employee"), pk=period_id)
        ensure_period_write_access(request.user, period)
        revision = editable_revision(period)
        serializer = TimesheetAttachmentSerializer(
            data=request.data,
            context={"revision": revision, "request": request},
        )
        serializer.is_valid(raise_exception=True)
        attachment = serializer.save()
        return Response(TimesheetAttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)


class TimesheetAttachmentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, attachment_id):
        attachment = get_object_or_404(
            TimesheetAttachment.objects.select_related(
                "revision__period__employee",
                "revision__period__assignment__approver",
            ),
            pk=attachment_id,
        )
        ensure_period_read_access(request.user, attachment.revision.period)
        return FileResponse(
            attachment.file.open("rb"),
            as_attachment=True,
            filename=attachment.file.name.rsplit("/", 1)[-1],
            content_type="application/pdf",
        )


class TimesheetSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, period_id):
        period = get_object_or_404(TimesheetPeriod.objects.select_related("employee"), pk=period_id)
        ensure_period_write_access(request.user, period)
        revision = editable_revision(period)
        revision = call_service(TimesheetService.submit, revision)
        from .notifications import notify_timesheet_stakeholders
        notify_timesheet_stakeholders(revision, "submitted")
        return Response(TimesheetRevisionSerializer(revision).data)


class TimesheetApprovalQueueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        revisions = TimesheetRevision.objects.filter(
            status=TimesheetRevision.Status.SUBMITTED
        ).select_related(
            "period__employee",
            "period__assignment__project__client",
            "period__assignment__approver",
        ).prefetch_related("entries", "attachments").order_by("submitted_at")

        revisions = revisions.filter(period__assignment__approver=request.user)

        return Response(TimesheetRevisionSerializer(revisions, many=True).data)


class TimesheetFinanceQueueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, "role", None) != "finance":
            raise PermissionDenied("Only Finance can view the finance processing queue.")
        revisions = TimesheetRevision.objects.filter(
            status=TimesheetRevision.Status.FINANCE_PENDING
        ).select_related(
            "period__employee", "period__assignment__project__client", "reviewed_by"
        ).prefetch_related("entries", "attachments").order_by("hr_reviewed_at")
        return Response(TimesheetRevisionSerializer(revisions, many=True).data)

    def post(self, request, revision_id):
        if getattr(request.user, "role", None) != "finance":
            raise PermissionDenied("Only Finance can process timesheets.")
        revision = get_object_or_404(TimesheetRevision, pk=revision_id)
        serializer = TimesheetFinanceProcessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        revision = call_service(
            TimesheetService.finance_process, revision, request.user,
            serializer.validated_data.get("reference", ""),
        )
        return Response(TimesheetRevisionSerializer(revision).data)


class TimesheetReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, revision_id):
        revision = get_object_or_404(
            TimesheetRevision.objects.select_related("period__assignment"),
            pk=revision_id,
        )
        serializer = TimesheetReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        revision = call_service(
            TimesheetService.review,
            revision,
            request.user,
            serializer.validated_data["decision"],
            serializer.validated_data.get("comment", ""),
        )
        return Response(TimesheetRevisionSerializer(revision).data)
