from django.contrib import admin
from .models import CURRENT_USER

@admin.register(CURRENT_USER)
class UserAdmin(admin.ModelAdmin):

    list_display = (
        'email',
        'name',
        'role',
        'date_of_birth',
        'is_active',
        'is_staff',
        'created_at'
    )

    search_fields = ('email', 'name')
    ordering = ('email',)

    list_filter = ('role', 'is_active')

    fieldsets = (
        ('USER CREDENTIALS', {
            'fields': ('email', 'name', 'date_of_birth', 'TC', 'password')
        }),
        ('ROLES & PERMISSIONS', {
            'fields': ('role', 'is_active', 'is_staff')
        }),
    )