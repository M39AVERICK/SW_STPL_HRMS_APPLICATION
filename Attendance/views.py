from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from HR_APP.models import Employee
from .models import Attendance, AttendanceNotification, Shift
from .serializers import AttendanceSerializer, ShiftSerializer


HR_ADMIN_ROLES = {"admin", "hr"}


class MyAttendanceProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = get_object_or_404(Employee, user=request.user)
        return Response({
            "id": employee.id,
            "employee_id": employee.employee_id,
            "name": employee.full_name,
            "attendance_category": employee.attendance_category,
        })


class AttendanceNotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = AttendanceNotification.objects.filter(
            recipient=request.user
        ).select_related("attendance__employee", "attendance__project_assignment__project")[:30]
        return Response([
            {
                "id": item.id,
                "event": item.event,
                "is_read": item.is_read,
                "created_at": item.created_at,
                "attendance_id": item.attendance_id,
                "employee_name": item.attendance.employee.full_name,
                "attendance_date": item.attendance.attendance_date,
                "work_location": item.attendance.work_location,
                "project_name": (
                    item.attendance.project_assignment.project.name
                    if item.attendance.project_assignment_id else None
                ),
            }
            for item in notifications
        ])

    def post(self, request):
        updated = AttendanceNotification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True)
        return Response({"marked_read": updated})


class AttendanceAccessPermission(BasePermission):
    """Employees submit their own client-site attendance; approvers can review it."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return (
            getattr(request.user, "role", None) in HR_ADMIN_ROLES
            or getattr(request.user, "role", None) == "viewer"
        )

    def has_object_permission(self, request, view, obj):
        if getattr(request.user, "role", None) in HR_ADMIN_ROLES:
            return True
        if obj.employee.user_id == request.user.pk:
            return True
        return (
            request.method in SAFE_METHODS
            and obj.project_assignment_id is not None
            and obj.project_assignment.approver_id == request.user.pk
        )


class ShiftAccessPermission(BasePermission):
    """Signed-in users can view active shifts; HR/admin manage shifts."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return getattr(request.user, "role", None) in HR_ADMIN_ROLES


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, AttendanceAccessPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        "employee", "attendance_date", "status", "shift",
        "work_location", "project_assignment",
    ]
    search_fields = [
        "employee__first_name", "employee__last_name", "remarks",
        "project_assignment__project__name", "project_assignment__project__client__name",
    ]
    ordering_fields = ["attendance_date", "created_at"]
    ordering = ["-attendance_date"]

    def get_queryset(self):
        queryset = Attendance.objects.select_related(
            "employee",
            "shift",
            "project_assignment__project__client",
            "project_assignment__approver",
        )
        if getattr(self.request.user, "role", None) in HR_ADMIN_ROLES:
            return queryset
        return queryset.filter(
            Q(employee__user=self.request.user)
            | Q(project_assignment__approver=self.request.user)
        ).distinct()


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [IsAuthenticated, ShiftAccessPermission]

    def get_queryset(self):
        queryset = Shift.objects.all()
        if getattr(self.request.user, "role", None) in HR_ADMIN_ROLES:
            return queryset
        return queryset.filter(is_active=True)
