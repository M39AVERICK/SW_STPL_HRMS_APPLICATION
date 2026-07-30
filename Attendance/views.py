from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Attendance, Shift
from .serializers import AttendanceSerializer, ShiftSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("employee").all()
    serializer_class = AttendanceSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "employee",
        "attendance_date",
        "status",
        "shift",
    ]

    search_fields = [
        "employee__first_name",
        "employee__last_name",
        "remarks",
    ]

    ordering_fields = [
        "attendance_date",
        "created_at",
    ]

    ordering = ["-attendance_date"]

from rest_framework.response import Response

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer

    