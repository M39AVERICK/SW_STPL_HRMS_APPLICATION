from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

import pandas as pd
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from .models import Employee, Department
from .serializers import (
    EmployeeSerializer,
    DepartmentSerializer
)
from .permissions import IsAdminOrHRStrict
# ==========================================================
# Employee ViewSet
# ==========================================================
class EmployeeViewSet(ModelViewSet):

    queryset = (
        Employee.objects
        .select_related(
            "department",
            "bank",
            "extra",
            "documents",
        )
        .order_by("-created_at")
    )

    serializer_class = EmployeeSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    permission_classes = [
        IsAuthenticated,
        IsAdminOrHRStrict,
    ]

    

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "department",
        "is_active",
        "employment_type",
        "work_location",
    ]

    search_fields = [
        "employee_id",
        "name",
        "position",
        "official_email",
    ]

    ordering_fields = [
        "name",
        "joining_date",
        "salary",
        "created_at",
    ]

    ordering = ["-created_at"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
# ==========================================================
# Department ViewSet
# ==========================================================
class DepartmentViewSet(ModelViewSet):

    queryset = Department.objects.all().order_by('name')

    serializer_class = DepartmentSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrHRStrict
    ]

