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

        # Cleaned HTML string without CSS brace conflicts
        body = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">
          <div style="max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 28px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48" style="vertical-align: middle;">
                    <div style="background-color: #2563eb; color: #ffffff; font-weight: 800; font-size: 20px; width: 42px; height: 42px; border-radius: 12px; text-align: center; line-height: 42px;">S</div>
                  </td>
                  <td style="vertical-align: middle; padding-left: 12px;">
                    <div style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 0;">STPL Systems</div>
                    <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">Oracle HRMS Cloud • Account Security</div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Content -->
            <div style="padding: 36px 32px; color: #334155;">
              <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Password Reset Request</div>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                We received a request to reset the password for your STPL account. Click the button below to establish your new security credentials.
              </p>
              
              <!-- Action Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="{link}" target="_blank" style="background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block;">Reset Account Password</a>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #f1f5f9; border-left: 4px solid #64748b; padding: 14px; border-radius: 6px; font-size: 12px; color: #475569; margin-top: 24px;">
                <strong>Security Notice:</strong> This link will expire in 24 hours. If you did not request this change, please disregard this email or contact your STPL administrator.
              </div>

              <!-- Fallback Link -->
              <div style="margin-top: 20px; font-size: 11px; color: #64748b; word-break: break-all;">
                If the button above does not work, copy and paste this URL into your browser:<br>
                <a href="{link}" style="color: #2563eb;">{link}</a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              © 2026 STPL Enterprise Cloud Services. All rights reserved.<br>
              This is an automated system message. Please do not reply directly.
            </div>

          </div>
        </body>
        </html>
        """

        Utiles.send_email(
            subject="STPL Account: Reset Your Password",
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