from django.core.mail import EmailMultiAlternatives
from django.conf import settings

class Utiles:
    @staticmethod
    def send_email(subject, body, to_email):
        # Plain text fallback for simple mail clients
        text_content = "Please use an HTML-compatible email client to view this message."
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email]
        )
        
        # Attach the formatted HTML body explicitly
        email.attach_alternative(body, "text/html")
        email.send()