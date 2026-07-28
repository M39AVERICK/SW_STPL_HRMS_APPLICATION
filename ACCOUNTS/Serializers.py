from rest_framework import serializers
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import authenticate

from ACCOUNTS.models import CURRENT_USER
from ACCOUNTS.utiles import Utiles


# =========================
# 🔹 USER REGISTER
# =========================
class UserRegister_Serializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CURRENT_USER
        fields = ['email', 'name', 'date_of_birth', 'TC', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return CURRENT_USER.objects.create_user(**validated_data)


# =========================
# 🔹 LOGIN (SECURE + FRONTEND COMPATIBLE)
# =========================
from django.contrib.auth import authenticate

class Login_Serializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # 🔥 SAFE AUTH (IMPORTANT FIX)
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )

        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("Account is disabled")

        attrs['user'] = user
        return attrs

# =========================
# 🔹 USER PROFILE (USED IN LOGIN RESPONSE)
# =========================
class User_profile_Serializer(serializers.ModelSerializer):
    class Meta:
        model = CURRENT_USER
        fields = [
            'id',
            'email',
            'name',
            'date_of_birth',
            'TC',
            'role',
            'is_active'
        ]


# =========================
# 🔹 PASSWORD CHANGE
# =========================
class Password_change_Serializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context.get('user')

        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError("Old password is incorrect")

        return attrs

    def save(self, **kwargs):
        user = self.context.get('user')
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


# =========================
# 🔹 SEND PASSWORD RESET EMAIL
# =========================
class Send_email_Serializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get('email')

        try:
            user = CURRENT_USER.objects.get(email=email)
        except CURRENT_USER.DoesNotExist:
            raise serializers.ValidationError("User not found")

        uid = urlsafe_base64_encode(force_bytes(user.id))
        token = PasswordResetTokenGenerator().make_token(user)

        link = f"http://localhost:5173/reset-password/{uid}/{token}"

        body = (
            "Hello,\n\n"
            "Click below to reset your password:\n\n"
            f"{link}\n\n"
            "If not requested, ignore this email."
        )

        Utiles.send_email(
            subject="Password Reset",
            body=body,
            to_email=user.email
        )

        return attrs


# =========================
# 🔹 RESET PASSWORD
# =========================
class User_password_reset_email(serializers.Serializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError("Passwords do not match")

        uid = self.context.get('uid')
        token = self.context.get('token')

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CURRENT_USER.objects.get(id=user_id)
        except Exception:
            raise serializers.ValidationError("Invalid reset link")

        if not PasswordResetTokenGenerator().check_token(user, token):
            raise serializers.ValidationError("Invalid or expired token")

        self.context['user'] = user
        return attrs

    def save(self):
        user = self.context['user']
        user.set_password(self.validated_data['password1'])
        user.save()
        return user