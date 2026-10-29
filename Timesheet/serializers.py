from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from HR_APP.models import Employee
from ACCOUNTS.models import CURRENT_USER
from .models import (
    Client,
    EmployeeProjectAssignment,
    Project,
    TimesheetAttachment,
    TimesheetEntry,
    TimesheetPeriod,
    TimesheetRevision,
)
from .services import TimesheetService


def _raise_api_validation(exc):
    detail = getattr(exc, "message_dict", None) or exc.messages
    raise serializers.ValidationError(detail) from exc


class EmployeeProjectAssignmentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    client_name = serializers.CharField(source="project.client.name", read_only=True)
    site_name = serializers.CharField(source="project.site_name", read_only=True)
    attendance_category = serializers.CharField(
        source="employee.attendance_category", read_only=True
    )
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_id = serializers.CharField(source="employee.employee_id", read_only=True)
    approver_name = serializers.CharField(source="approver.name", read_only=True)
    approver_email = serializers.EmailField(source="approver.email", read_only=True)

    class Meta:
        model = EmployeeProjectAssignment
        fields = [
            "id", "employee", "employee_name", "employee_id", "attendance_category",
            "project", "project_name", "client_name", "site_name", "approver",
            "approver_name", "approver_email", "start_date", "end_date",
            "expected_daily_minutes", "is_active",
        ]
        read_only_fields = [
            "id", "employee_name", "employee_id", "attendance_category", "project_name",
            "client_name", "site_name", "approver_name", "approver_email",
        ]

    def validate(self, attrs):
        employee = attrs.get("employee", getattr(self.instance, "employee", None))
        project = attrs.get("project", getattr(self.instance, "project", None))
        approver = attrs.get("approver", getattr(self.instance, "approver", None))
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))

        if employee and employee.attendance_category != Employee.AttendanceCategory.ON_SITE:
            raise serializers.ValidationError({"employee": "Only On-site employees can be assigned to client projects."})
        assignment_is_active = attrs.get("is_active", getattr(self.instance, "is_active", True))
        if assignment_is_active and employee and not employee.is_active:
            raise serializers.ValidationError({"employee": "Select an active employee."})
        if assignment_is_active and project and (not project.is_active or not project.client.is_active):
            raise serializers.ValidationError({"project": "Select an active project and client."})
        if approver and approver.role not in {"admin", "hr", "approver"}:
            raise serializers.ValidationError({"approver": "Choose an account with the Approver, HR, or Admin role."})
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be before the start date."})
        expected_minutes = attrs.get(
            "expected_daily_minutes",
            getattr(self.instance, "expected_daily_minutes", 480),
        )
        if not 1 <= expected_minutes <= 1440:
            raise serializers.ValidationError({"expected_daily_minutes": "Enter a value between 1 and 1440 minutes."})
        return attrs


class ClientSerializer(serializers.ModelSerializer):
    project_count = serializers.IntegerField(source="projects.count", read_only=True)

    class Meta:
        model = Client
        fields = ["id", "name", "code", "is_active", "project_count"]
        read_only_fields = ["id", "project_count"]


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    assignment_count = serializers.IntegerField(source="employee_assignments.count", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "client", "client_name", "name", "site_name", "code",
            "is_active", "assignment_count",
        ]
        read_only_fields = ["id", "client_name", "assignment_count"]

    def validate_client(self, client):
        if not client.is_active and self.initial_data.get("is_active", True):
            raise serializers.ValidationError("Select an active client for an active project.")
        return client

    def validate(self, attrs):
        client = attrs.get("client", getattr(self.instance, "client", None))
        is_active = attrs.get("is_active", getattr(self.instance, "is_active", True))
        if is_active and client and not client.is_active:
            raise serializers.ValidationError({"client": "An active project must belong to an active client."})
        return attrs


class TimesheetApproverSerializer(serializers.ModelSerializer):
    class Meta:
        model = CURRENT_USER
        fields = ["id", "name", "email", "role"]
        read_only_fields = fields


class TimesheetAccessUserSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()

    class Meta:
        model = CURRENT_USER
        fields = ["id", "name", "email", "role", "is_active", "employee_name", "employee_id"]
        read_only_fields = fields

    def get_employee(self, obj):
        return obj.employee_set.order_by("id").first()

    def get_employee_name(self, obj):
        employee = self.get_employee(obj)
        return employee.full_name if employee else ""

    def get_employee_id(self, obj):
        employee = self.get_employee(obj)
        return employee.employee_id if employee else ""


class TimesheetPeriodCreateSerializer(serializers.Serializer):
    assignment = serializers.PrimaryKeyRelatedField(
        queryset=EmployeeProjectAssignment.objects.select_related("employee", "project")
    )
    week_start = serializers.DateField()
    employee = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        required=False,
    )


class TimesheetEntrySerializer(serializers.Serializer):
    work_date = serializers.DateField()
    regular_hours = serializers.DecimalField(max_digits=5, decimal_places=2)
    extra_hours = serializers.DecimalField(max_digits=5, decimal_places=2)
    work_description = serializers.CharField()

    def create(self, validated_data):
        try:
            return TimesheetService.save_daily_entry(
                revision=self.context["revision"],
                **validated_data,
            )
        except DjangoValidationError as exc:
            _raise_api_validation(exc)

    def update(self, instance, validated_data):
        regular_hours = validated_data.get(
            "regular_hours", Decimal(instance.regular_minutes) / Decimal(60)
        )
        extra_hours = validated_data.get(
            "extra_hours", Decimal(instance.extra_minutes) / Decimal(60)
        )
        try:
            return TimesheetService.save_daily_entry(
                revision=instance.revision,
                work_date=validated_data.get("work_date", instance.work_date),
                regular_hours=regular_hours,
                extra_hours=extra_hours,
                work_description=validated_data.get(
                    "work_description", instance.work_description
                ),
            )
        except DjangoValidationError as exc:
            _raise_api_validation(exc)

    def to_representation(self, instance):
        def minutes_as_hours(minutes):
            hours = Decimal(minutes) / Decimal(60)
            return str(hours.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP))

        return {
            "id": instance.id,
            "work_date": instance.work_date,
            "regular_hours": minutes_as_hours(instance.regular_minutes),
            "extra_hours": minutes_as_hours(instance.extra_minutes),
            "work_description": instance.work_description,
        }


class TimesheetAttachmentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    file_name = serializers.CharField(source="file.name", read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = TimesheetAttachment
        fields = ["id", "file", "file_name", "download_url", "uploaded_by", "uploaded_at"]
        read_only_fields = ["id", "uploaded_by", "uploaded_at"]

    def get_download_url(self, attachment):
        request = self.context.get("request")
        path = f"/api/timesheets/attachments/{attachment.pk}/download/"
        return request.build_absolute_uri(path) if request else path

    def create(self, validated_data):
        revision = self.context["revision"]
        request = self.context["request"]
        if revision.status != TimesheetRevision.Status.DRAFT:
            raise serializers.ValidationError(
                "Attach a PDF while the timesheet revision is a draft."
            )
        return TimesheetAttachment.objects.create(
            revision=revision,
            uploaded_by=request.user,
            **validated_data,
        )


class TimesheetRevisionSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="period.employee.full_name", read_only=True)
    employee_id = serializers.CharField(source="period.employee.employee_id", read_only=True)
    project_name = serializers.CharField(source="period.assignment.project.name", read_only=True)
    client_name = serializers.CharField(source="period.assignment.project.client.name", read_only=True)
    site_name = serializers.CharField(source="period.assignment.project.site_name", read_only=True)
    week_start = serializers.DateField(source="period.week_start", read_only=True)
    week_end = serializers.DateField(source="period.week_end", read_only=True)
    approver_name = serializers.CharField(source="reviewed_by.name", read_only=True, allow_null=True)
    hr_reviewer_name = serializers.CharField(source="hr_reviewed_by.name", read_only=True, allow_null=True)
    finance_processor_name = serializers.CharField(source="finance_processed_by.name", read_only=True, allow_null=True)
    payroll_recorder_name = serializers.CharField(source="payroll_recorded_by.name", read_only=True, allow_null=True)
    entries = TimesheetEntrySerializer(many=True, read_only=True)
    attachments = TimesheetAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = TimesheetRevision
        fields = [
            "id",
            "revision_number",
            "status",
            "employee_note",
            "submitted_at",
            "reviewed_by",
            "reviewed_at",
            "reviewer_comment",
            "hr_reviewed_by",
            "hr_reviewed_at",
            "hr_comment",
            "finance_processed_by",
            "finance_processed_at",
            "finance_reference",
            "payroll_days", "payroll_hours", "payroll_note",
            "payroll_recorded_by", "payroll_recorded_at",
            "approver_name",
            "hr_reviewer_name",
            "finance_processor_name",
            "payroll_recorder_name",
            "employee_name",
            "employee_id",
            "project_name",
            "client_name",
            "site_name",
            "week_start",
            "week_end",
            "entries",
            "attachments",
        ]
        read_only_fields = [
            "id",
            "revision_number",
            "status",
            "submitted_at",
            "reviewed_by",
            "reviewed_at",
            "reviewer_comment",
            "hr_reviewed_by",
            "hr_reviewed_at",
            "hr_comment",
            "finance_processed_by",
            "finance_processed_at",
            "finance_reference",
            "payroll_days", "payroll_hours", "payroll_note",
            "payroll_recorded_by", "payroll_recorded_at",
        ]


class TimesheetPeriodSerializer(serializers.ModelSerializer):
    week_end = serializers.DateField(read_only=True)
    latest_revision = serializers.SerializerMethodField()

    class Meta:
        model = TimesheetPeriod
        fields = [
            "id",
            "employee",
            "assignment",
            "week_start",
            "week_end",
            "created_at",
            "latest_revision",
        ]
        read_only_fields = fields

    def get_latest_revision(self, period):
        revision = period.revisions.order_by("-revision_number").first()
        if revision is None:
            return None
        return TimesheetRevisionSerializer(revision, context=self.context).data


class TimesheetReviewSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=["approve", "request_changes"])
    comment = serializers.CharField(required=False, allow_blank=True)


class TimesheetFinanceProcessSerializer(serializers.Serializer):
    reference = serializers.CharField(required=False, allow_blank=True, max_length=100)
