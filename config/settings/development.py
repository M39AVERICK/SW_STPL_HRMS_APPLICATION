from .base import *

DEBUG = os.getenv("DEBUG", "True").lower() in {"1", "true", "yes"}
