from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


# 🔹 Custom User Manager
class MYusermanager(BaseUserManager):

    def create_user(self, email, name, date_of_birth, TC, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        if not name:
            raise ValueError("Users must have a name")
        if not date_of_birth:
            raise ValueError("Users must have a date of birth")
        if not TC:
            raise ValueError("Users must accept the terms and conditions")

        user = self.model(
            email=self.normalize_email(email),
            name=name,
            date_of_birth=date_of_birth,
            TC=TC,
            role='viewer'   # default role
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, date_of_birth, TC, password=None):
        user = self.create_user(
            email=email,
            name=name,
            date_of_birth=date_of_birth,
            TC=TC,
            password=password
        )

        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True

        user.save(using=self._db)
        return user


# 🔹 Custom User Model
class CURRENT_USER(AbstractBaseUser, PermissionsMixin):

    email = models.EmailField(unique=True, max_length=255)
    name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    TC = models.BooleanField()

    # 🔥 ROLE SYSTEM (CORE)
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('hr', 'HR'),
        ('viewer', 'Viewer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='viewer')

    # 🔹 Django Required Fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)   # controls admin panel access

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = MYusermanager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'date_of_birth', 'TC']

    def __str__(self):
        return self.email

    # 🔥 AUTO ROLE → PERMISSION SYNC
    def save(self, *args, **kwargs):
        if self.role == 'admin':
            self.is_staff = True
            self.is_superuser = True

        elif self.role == 'hr':
            self.is_staff = True
            self.is_superuser = False

        elif self.role == 'viewer':
            self.is_staff = False
            self.is_superuser = False

        super().save(*args, **kwargs)

    # 🔐 PERMISSIONS CONTROL
    def has_perm(self, perm, obj=None):
        return self.is_superuser or self.role in ['admin', 'hr']

    def has_module_perms(self, app_label):
        return self.is_superuser or self.role in ['admin', 'hr']