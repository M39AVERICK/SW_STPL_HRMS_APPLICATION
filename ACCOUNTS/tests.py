from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework.test import APIClient

from .Serializers import ProfilePictureUploadSerializer


class PublicRegistrationTests(TestCase):
    def test_registration_ignores_stale_bearer_token(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Bearer invalid-token")

        response = client.post("/api/users/register/", {}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)


class ProfilePictureFormatTests(TestCase):
    def image_file(self, name, image_format):
        output = BytesIO()
        Image.new("RGB", (2, 2), color="blue").save(output, format=image_format)
        return SimpleUploadedFile(name, output.getvalue(), content_type=f"image/{image_format.lower()}")

    def test_jpg_and_png_profile_pictures_are_accepted(self):
        for upload in (self.image_file("profile.jpg", "JPEG"), self.image_file("profile.png", "PNG")):
            serializer = ProfilePictureUploadSerializer(data={"profile_picture": upload})
            self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_pdf_is_not_accepted_as_a_profile_picture(self):
        upload = SimpleUploadedFile("profile.pdf", b"%PDF-1.4", content_type="application/pdf")
        serializer = ProfilePictureUploadSerializer(data={"profile_picture": upload})
        self.assertFalse(serializer.is_valid())
