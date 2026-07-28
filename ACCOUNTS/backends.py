# ACCOUNTS/backends.py

from django.contrib.auth.backends import BaseBackend
from ACCOUNTS.models import CURRENT_USER

class EmailBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = CURRENT_USER.objects.get(email=email)
            if user.check_password(password):
                return user
        except CURRENT_USER.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return CURRENT_USER.objects.get(pk=user_id)
        except CURRENT_USER.DoesNotExist:
            return None