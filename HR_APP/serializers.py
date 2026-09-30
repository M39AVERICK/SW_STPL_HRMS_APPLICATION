from rest_framework import serializers

from .models import (
    Employee,
    BankDetail,
    EmployeeExtra,
    EmployeeDocument,
    Department
)

from .validators import (
    validate_pan,
    validate_aadhar,
    validate_ifsc
)


# ======================================================
# Department Serializer
# ======================================================
class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = '__all__'


# ======================================================
# Bank Detail Serializer
# ======================================================
class BankDetailSerializer(serializers.ModelSerializer):

    ifsc_code = serializers.CharField(
        validators=[validate_ifsc]
    )

    class Meta:
        model = BankDetail

        fields = [

    "bank_name",
    "account_holder_name",
    "account_number",
    "ifsc_code",
    "branch_name",
    "account_type",
]

    extra_kwargs = {

    "bank_name": {"required": False},
    "account_holder_name": {"required": False},
    "account_number": {"required": False},
    "ifsc_code": {"required": False},
    "branch_name": {"required": False},
    "account_type": {"required": False},
}


# ======================================================
# Employee Extra Serializer
# ======================================================
class EmployeeExtraSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmployeeExtra

        fields = [

    "current_address",
    "permanent_address",

    "city",
    "state",
    "country",
    "postal_code",

    "emergency_contact_name",
    "emergency_contact_number",
    "emergency_contact_relation",

    "skills",
    "experience_years",

    "asset_id",
    "laptop_number",

    "remarks",
]

        extra_kwargs = {

    "current_address": {"required": False},
    "permanent_address": {"required": False},

    "city": {"required": False},
    "state": {"required": False},
    "country": {"required": False},
    "postal_code": {"required": False},

    "emergency_contact_name": {"required": False},
    "emergency_contact_number": {"required": False},
    "emergency_contact_relation": {"required": False},

    "skills": {"required": False},
    "experience_years": {"required": False},

    "asset_id": {"required": False},
    "laptop_number": {"required": False},

    "remarks": {"required": False},
}


# ======================================================
# Employee Document Serializer
# ======================================================
class EmployeeDocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmployeeDocument

        fields = [
            'pan_document',
            'aadhaar_document',
            'resume',
            'offer_letter',
            'experience_certificate',
            'other_document'
        ]


# ======================================================
# Main Employee Serializer
# ======================================================
class EmployeeSerializer(serializers.ModelSerializer):

    bank = BankDetailSerializer(required=False)
    extra = EmployeeExtraSerializer(required=False)
    documents = EmployeeDocumentSerializer(required=False)

    full_name = serializers.ReadOnlyField()

    pan = serializers.CharField(
        validators=[validate_pan],
        required=False
    )

    aadhaar = serializers.CharField(
        validators=[validate_aadhar],
        required=False
    )

    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    class Meta:
        model = Employee

        fields = [
            "id",
            "employee_id",

            # Personal
            "first_name",
            "middle_name",
            "last_name",
            "full_name",
            "gender",
            "date_of_birth",
            "phone_number",
            "official_email",
            "personal_email",
            "profile_picture",
            "marital_status",
            "blood_group",
            "nationality",
            "father_name",
            "mother_name",

            # Professional
            "position",
            "employee_type",
            "reporting_manager",
            "employment_type",
            "department",
            "department_name",
            "joining_date",
            "work_location",
            "salary",

            # Identity
            "pan",
            "aadhaar",
            "uan",
            "pf_number",

            # Status
            "is_active",
            "created_at",
            "user",

            # Related
            "bank",
            "extra",
            "documents",
        ]

        read_only_fields = [
            "employee_id",
            "created_at",
            "user",
        ]

    # =========================================================
    # SALARY VALIDATION
    # =========================================================

    def validate_salary(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Salary cannot be negative."
            )

        return value

    # =========================================================
    # CREATE
    # =========================================================

    def create(self, validated_data):

        request = self.context["request"]

        # Remove nested objects because we create them manually
        validated_data.pop("bank", None)
        validated_data.pop("extra", None)
        validated_data.pop("documents", None)

        # -----------------------------------------------------
        # EMPLOYEE
        # -----------------------------------------------------

        employee = Employee.objects.create(
            user=request.user,
            **validated_data
        )

        # -----------------------------------------------------
        # BANK
        # -----------------------------------------------------

        BankDetail.objects.create(

            employee=employee,

            bank_name=request.data.get(
                "bank.bank_name",
                ""
            ),

            account_holder_name=request.data.get(
                "bank.account_holder_name",
                ""
            ),

            account_number=request.data.get(
                "bank.account_number",
                ""
            ),

            ifsc_code=request.data.get(
                "bank.ifsc_code",
                ""
            ),

            branch_name=request.data.get(
                "bank.branch_name",
                ""
            ),

            account_type=request.data.get(
                "bank.account_type",
                "SAVINGS"
            ),
        )

        # -----------------------------------------------------
        # EXTRA + CONTACT
        # -----------------------------------------------------

        EmployeeExtra.objects.create(

            employee=employee,

            current_address=request.data.get(
                "extra.current_address",
                ""
            ),

            permanent_address=request.data.get(
                "extra.permanent_address",
                ""
            ),

            city=request.data.get(
                "extra.city",
                ""
            ),

            state=request.data.get(
                "extra.state",
                ""
            ),

            country=request.data.get(
                "extra.country",
                "India"
            ),

            postal_code=request.data.get(
                "extra.postal_code",
                ""
            ),

            emergency_contact_name=request.data.get(
                "extra.emergency_contact_name",
                ""
            ),

            emergency_contact_number=request.data.get(
                "extra.emergency_contact_number",
                ""
            ),

            emergency_contact_relation=request.data.get(
                "extra.emergency_contact_relation",
                ""
            ),

            skills=request.data.get(
                "extra.skills",
                ""
            ),

            experience_years=request.data.get(
                "extra.experience_years"
            ) or None,

            asset_id=request.data.get(
                "extra.asset_id",
                ""
            ),

            laptop_number=request.data.get(
                "extra.laptop_number",
                ""
            ),

            remarks=request.data.get(
                "extra.remarks",
                ""
            ),
        )

        # -----------------------------------------------------
        # DOCUMENTS
        # -----------------------------------------------------

        EmployeeDocument.objects.create(

            employee=employee,

            resume=request.FILES.get(
                "documents.resume"
            ),

            offer_letter=request.FILES.get(
                "documents.offer_letter"
            ),

            pan_document=request.FILES.get(
                "documents.pan_document"
            ),

            aadhaar_document=request.FILES.get(
                "documents.aadhaar_document"
            ),

            experience_certificate=request.FILES.get(
                "documents.experience_certificate"
            ),

            other_document=request.FILES.get(
                "documents.other_document"
            ),
        )

        return employee

    # =========================================================
    # UPDATE
    # =========================================================

    def update(self, instance, validated_data):

        request = self.context["request"]

        # Remove nested objects because we handle them manually
        validated_data.pop("bank", None)
        validated_data.pop("extra", None)
        validated_data.pop("documents", None)

        # -----------------------------------------------------
        # EMPLOYEE
        # -----------------------------------------------------

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # =====================================================
        # BANK
        # =====================================================

        bank, created = BankDetail.objects.get_or_create(
            employee=instance
        )

        bank_fields = [
            "bank_name",
            "account_holder_name",
            "account_number",
            "ifsc_code",
            "branch_name",
            "account_type",
        ]

        for field in bank_fields:

            key = f"bank.{field}"

            if key in request.data:
                value = request.data.get(key)

                # Keep existing value if blank
                if value not in [None, ""]:
                    setattr(bank, field, value)

        bank.save()

        # =====================================================
        # EXTRA + CONTACT
        # =====================================================

        extra, created = EmployeeExtra.objects.get_or_create(
            employee=instance
        )

        extra_fields = [
            "current_address",
            "permanent_address",
            "city",
            "state",
            "country",
            "postal_code",
            "emergency_contact_name",
            "emergency_contact_number",
            "emergency_contact_relation",
            "skills",
            "experience_years",
            "asset_id",
            "laptop_number",
            "remarks",
        ]

        for field in extra_fields:

            key = f"extra.{field}"

            if key in request.data:

                value = request.data.get(key)

                # For experience_years
                if field == "experience_years":

                    if value not in [None, ""]:
                        setattr(
                            extra,
                            field,
                            value
                        )

                # For all normal fields
                else:

                    if value not in [None, ""]:
                        setattr(
                            extra,
                            field,
                            value
                        )

        extra.save()

        # =====================================================
        # DOCUMENTS
        # =====================================================

        document_obj, created = (
            EmployeeDocument.objects.get_or_create(
                employee=instance
            )
        )

        document_fields = [
            "resume",
            "offer_letter",
            "pan_document",
            "aadhaar_document",
            "experience_certificate",
            "other_document",
        ]

        for field in document_fields:

            uploaded_file = request.FILES.get(
                f"documents.{field}"
            )

            # IMPORTANT:
            # Only replace the existing document
            # when a new file was actually uploaded.
            if uploaded_file:

                setattr(
                    document_obj,
                    field,
                    uploaded_file
                )

        document_obj.save()

        return instance
