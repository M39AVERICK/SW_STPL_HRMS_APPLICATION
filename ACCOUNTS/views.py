from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ACCOUNTS.Serializers import (
    UserRegister_Serializer,
    Login_Serializer,
    User_profile_Serializer,
    Password_change_Serializer,
    Send_email_Serializer,
    User_password_reset_email,
    ProfilePictureUploadSerializer,
)

from ACCOUNTS.renderers import UserRenderer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.exceptions import PermissionDenied
from django.http import FileResponse
from django.shortcuts import get_object_or_404


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
    authentication_classes = []
    permission_classes = [AllowAny]

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
        from HR_APP.models import Employee

        employee = Employee.objects.select_related("department").filter(user=request.user).first()
        return Response({
            "data": serializer.data,
            "employee": ({
                "id": employee.id,
                "employee_id": employee.employee_id,
                "full_name": employee.full_name,
                "official_email": employee.official_email,
                "position": employee.position,
                "department": employee.department.name if employee.department_id else "",
                "attendance_category": employee.attendance_category,
                "work_location": employee.work_location,
                "joining_date": employee.joining_date,
                "profile_picture": request.build_absolute_uri(employee.profile_picture.url) if employee.profile_picture else "",
                "documents": self._document_links(request, employee),
            } if employee else None),
            "msg": "Profile retrieved successfully"
        }, status=200)

    @staticmethod
    def _document_links(request, employee):
        from HR_APP.models import EmployeeDocument
        documents = EmployeeDocument.objects.filter(employee=employee).first()
        if not documents:
            return []
        fields = ("pan_document", "aadhaar_document", "resume", "offer_letter", "experience_certificate", "other_document")
        return [{"field": name, "name": getattr(documents, name).name.rsplit("/", 1)[-1],
                 "url": request.build_absolute_uri(f"/api/users/profile/documents/{name}/")}
                for name in fields if getattr(documents, name)]

    def patch(self, request):
        from HR_APP.models import Employee
        employee = Employee.objects.filter(user=request.user).first()
        if not employee:
            raise PermissionDenied("No employee record is linked to this login.")
        serializer = ProfilePictureUploadSerializer(data=request.FILES)
        serializer.is_valid(raise_exception=True)
        employee.profile_picture = serializer.validated_data["profile_picture"]
        employee.save(update_fields=["profile_picture"])
        return Response({"profile_picture": request.build_absolute_uri(employee.profile_picture.url)})


class ProfileDocumentDownload(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, field):
        from HR_APP.models import Employee, EmployeeDocument
        if getattr(request.user, "role", None) not in {"admin", "hr"}:
            employee = Employee.objects.filter(user=request.user).first()
            if not employee:
                raise PermissionDenied("No employee record is linked to this login.")
            record = EmployeeDocument.objects.filter(employee=employee).first()
        else:
            employee_id = request.query_params.get("employee")
            employee = get_object_or_404(Employee, pk=employee_id)
            record = EmployeeDocument.objects.filter(employee=employee).first()
        allowed = {"pan_document", "aadhaar_document", "resume", "offer_letter", "experience_certificate", "other_document"}
        if field not in allowed or not record or not getattr(record, field):
            from rest_framework.exceptions import NotFound
            raise NotFound("Document not found.")
        file = getattr(record, field)
        return FileResponse(file.open("rb"), as_attachment=True, filename=file.name.rsplit("/", 1)[-1])


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
