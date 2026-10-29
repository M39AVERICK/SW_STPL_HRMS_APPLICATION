from django.test import TestCase
from rest_framework.test import APIClient


class PublicRegistrationTests(TestCase):
    def test_registration_ignores_stale_bearer_token(self):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Bearer invalid-token")

        response = client.post("/api/users/register/", {}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)
