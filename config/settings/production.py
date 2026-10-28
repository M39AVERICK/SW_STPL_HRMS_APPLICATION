from .base import *

DEBUG = False
SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "True").lower() in {"1", "true", "yes"}

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
