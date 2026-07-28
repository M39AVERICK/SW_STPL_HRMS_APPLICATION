from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ACCOUNTS.Serializers import (
    UserRegister_Serializer,
    Login_Serializer,
    User_profile_Serializer,
    Password_change_Serializer,
    Send_email_Serializer,
    User_password_reset_email
)

from ACCOUNTS.renderers import UserRenderer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import IsAuthenticated


# =========================
# 🔐 TOKEN GENERATOR
# =========================
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# =========================
# 🔹 REGISTER
# =========================
class User_register(APIView):
    renderer_classes = [UserRenderer]

    def post(self, request):
        serializer = UserRegister_Serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)

            return Response({
                "token": tokens,
                "msg": "User Registered Successfully"
            }, status=201)

        return Response(serializer.errors, status=400)


# =========================
# 🔹 LOGIN (HRMS FIXED)
# =========================
class User_login(APIView):
    renderer_classes = [UserRenderer]

    def post(self, request):
        serializer = Login_Serializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.validated_data.get("user")

        # 🔐 Tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # 👤 User data
        user_data = User_profile_Serializer(user).data

        response = Response({
            "access": access_token,
            "refresh": str(refresh),
            "user": user_data,
            "role": user.role,
            "msg": "Login successful"
        }, status=200)

        # 🔐 Secure refresh cookie
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,   # True in production HTTPS
            samesite="Lax",
            max_age=7 * 24 * 60 * 60
        )

        return response


# =========================
# 🔹 PROFILE
# =========================
class Profile(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = User_profile_Serializer(request.user)
        return Response({
            "data": serializer.data,
            "msg": "Profile retrieved successfully"
        }, status=200)


# =========================
# 🔹 CHANGE PASSWORD
# =========================
class Change_password(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = Password_change_Serializer(
            data=request.data,
            context={'user': request.user}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"msg": "Password changed successfully"}, status=200)


# =========================
# 🔹 RESET PASSWORD EMAIL
# =========================
class Reset_password(APIView):
    renderer_classes = [UserRenderer]

    def post(self, request):
        serializer = Send_email_Serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        return Response({"msg": "Password reset link sent"}, status=200)


# =========================
# 🔹 RESET PASSWORD
# =========================
class Reset_password_after_email(APIView):
    renderer_classes = [UserRenderer]

    def post(self, request, uid, token):
        serializer = User_password_reset_email(
            data=request.data,
            context={'uid': uid, 'token': token}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"msg": "Password reset successful"}, status=200)


# =========================
# 🔹 TOKEN REFRESH
# =========================
class TokenRefreshFromCookie(APIView):

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "No refresh token"}, status=401)

        try:
            refresh = RefreshToken(refresh_token)

            return Response({
                "access": str(refresh.access_token)
            }, status=200)

        except TokenError:
            return Response({"error": "Invalid or expired token"}, status=401)


# =========================
# 🔹 LOGOUT
# =========================
class LogoutView(APIView):

    def post(self, request):
        response = Response({"msg": "Logged out successfully"}, status=200)
        response.delete_cookie("refresh_token")
        return response