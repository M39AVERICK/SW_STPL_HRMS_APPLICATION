from django.core.mail import EmailMessage
from django.conf import settings

class Utiles:
    @staticmethod
    def send_email(subject, body, to_email):
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,  # ✅ FIXED
            to=[to_email]
        )
        email.send()

