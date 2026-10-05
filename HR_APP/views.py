from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse


from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

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

    parser_classes = (
        JSONParser,
        MultiPartParser,
        FormParser,
    )

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
        "first_name",
        "middle_name",
        "last_name",
        "position",
        "official_email",
    ]

    ordering_fields = [
        "first_name",
        "last_name",
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

    # ==========================================
    # EXPORT
    # ==========================================
    @action(
        detail=False,
        methods=["get"],
        url_path="export"
    )
    def export_employees(self, request):

        employees = self.get_queryset()

        ids = request.query_params.get("ids")

        if ids:
            employee_ids = [
                value.strip()
                for value in ids.split(",")
                if value.strip()
            ]

            employees = employees.filter(
                id__in=employee_ids
            )

        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = "Employees"

        headers = [
            "Employee ID",
            "First Name",
            "Middle Name",
            "Last Name",
            "Gender",
            "Date of Birth",
            "Phone Number",
            "Official Email",
            "Personal Email",
            "Marital Status",
            "Blood Group",
            "Nationality",
            "Father Name",
            "Mother Name",
            "Position",
            "Employee Type",
            "Employment Type",
            "Department",
            "Work Location",
            "Joining Date",
            "Salary",
            "PAN",
            "Aadhaar",
            "UAN",
            "PF Number",
            "Status",
        ]

        worksheet.append(headers)

        for cell in worksheet[1]:
            cell.font = Font(
                bold=True,
                color="FFFFFF"
            )
            cell.fill = PatternFill(
                fill_type="solid",
                fgColor="2563EB"
            )

        for employee in employees:

            worksheet.append([
                employee.employee_id,
                employee.first_name,
                employee.middle_name or "",
                employee.last_name,
                employee.gender or "",
                employee.date_of_birth or "",
                employee.phone_number,
                employee.official_email,
                employee.personal_email or "",
                employee.marital_status or "",
                employee.blood_group or "",
                employee.nationality,
                employee.father_name or "",
                employee.mother_name or "",
                employee.position,
                employee.employee_type or "",
                employee.employment_type,
                (
                    employee.department.name
                    if employee.department
                    else ""
                ),
                employee.work_location or "",
                employee.joining_date,
                employee.salary,
                employee.pan,
                employee.aadhaar,
                employee.uan or "",
                employee.pf_number or "",
                "Active" if employee.is_active else "Inactive",
            ])

        for column in worksheet.columns:

            max_length = 0
            column_letter = column[0].column_letter

            for cell in column:
                if cell.value is not None:
                    max_length = max(
                        max_length,
                        len(str(cell.value))
                    )

            worksheet.column_dimensions[
                column_letter
            ].width = min(max_length + 2, 35)

        response = HttpResponse(
            content_type=(
                "application/"
                "vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

        response["Content-Disposition"] = (
            'attachment; filename="employees.xlsx"'
        )

        workbook.save(response)

        return response
        # ==========================================
    # IMPORT
    # ==========================================
    @action(
        detail=False,
        methods=["post"],
        url_path="import"
    )
    def import_employees(self, request):

        file = request.FILES.get("file")

        if not file:
            return Response(
                {"error": "No file uploaded."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": "File received successfully.",
                "filename": file.name
            },
            status=status.HTTP_200_OK
        )


# ==========================================================
# Department ViewSet
# ==========================================================
class DepartmentViewSet(ModelViewSet):

    queryset = Department.objects.all().order_by("name")

    serializer_class = DepartmentSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrHRStrict
    ]
