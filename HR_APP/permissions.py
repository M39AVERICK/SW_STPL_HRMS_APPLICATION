from rest_framework.permissions import BasePermission

class IsAdminOrHRStrict(BasePermission):
    """
    Only admin and hr can access anything in HR module.
    Viewer and others → completely blocked.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user
            and user.is_authenticated
            and user.role in ['admin', 'hr']
        )