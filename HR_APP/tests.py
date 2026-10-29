from datetime import date

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from ACCOUNTS.models import CURRENT_USER
from .models import Employee
from .serializers import EmployeeDocumentSerializer


class EmployeeAccountStatusTests(TestCase):
    def setUp(self):
        self.hr_user = CURRENT_USER.objects.create_user(
            email="hr@example.test",
            name="HR User",
            date_of_birth=date(1985, 1, 1),
            TC=True,
            password="Strong-test-password-123",
        )
        self.hr_user.role = "hr"
        self.hr_user.save()
        self.viewer = CURRENT_USER.objects.create_user(
            email="employee@example.test",
            name="Example Employee",
            date_of_birth=date(1995, 1, 1),
            TC=True,
            password="Strong-test-password-123",
        )
        self.employee = Employee.objects.create(
            user=self.viewer,
            first_name="Example",
            last_name="Employee",
            phone_number="9000000000",
            official_email="employee@example.test",
            position="Analyst",
            joining_date=date(2025, 1, 1),
            salary="50000.00",
            pan="ABCDE1234F",
            aadhaar="123456789012",
        )

    def test_hr_deactivation_disables_linked_viewer_login(self):
        client = APIClient()
        client.force_authenticate(self.hr_user)

        response = client.patch(
            f"/api/hr/employees/{self.employee.pk}/",
            {"is_active": False},
            format="multipart",
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.employee.refresh_from_db()
        self.viewer.refresh_from_db()
        self.assertFalse(self.employee.is_active)
        self.assertFalse(self.viewer.is_active)

    def test_inactive_employee_cannot_login_even_if_account_flag_is_still_active(self):
        self.employee.is_active = False
        self.employee.save(update_fields=["is_active"])

        response = APIClient().post(
            "/api/users/login/",
            {"email": self.viewer.email, "password": "Strong-test-password-123"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)


class EmployeeDocumentFormatTests(TestCase):
    def test_pdf_jpg_and_png_documents_are_accepted(self):
        for filename in ("resume.pdf", "resume.jpg", "resume.png"):
            serializer = EmployeeDocumentSerializer(data={
                "resume": SimpleUploadedFile(filename, b"file-content"),
            })
            self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_unsupported_document_extension_is_rejected(self):
        serializer = EmployeeDocumentSerializer(data={
            "resume": SimpleUploadedFile("resume.docx", b"file-content"),
        })
        self.assertFalse(serializer.is_valid())
