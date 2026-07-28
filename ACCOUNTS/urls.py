from django.urls import path
from .views import (
    User_register,
    User_login,
    Profile,
    Change_password,
    Reset_password,
    Reset_password_after_email,
    TokenRefreshFromCookie,
    LogoutView
)

urlpatterns = [
    # 🔐 Auth
    path('register/', User_register.as_view(), name='register'),
    path('login/', User_login.as_view(), name='login'),
    path('refresh/', TokenRefreshFromCookie.as_view(), name='token_refresh'),  # 🔥 NEW
    path('logout/', LogoutView.as_view(), name='logout'),  # 🔥 NEW

    # 👤 User
    path('profile/', Profile.as_view(), name='profile'),

    # 🔑 Password
    path('change-password/', Change_password.as_view(), name='change-password'),

    # 📧 Reset via email
    path('reset-password/', Reset_password.as_view(), name='reset-password'),
    path('reset-password/<uid>/<token>/', Reset_password_after_email.as_view(), name='reset-password-confirm'),
]