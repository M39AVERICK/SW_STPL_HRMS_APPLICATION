from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    AttendanceNotificationListView,
    AttendanceViewSet,
    MyAttendanceProfileView,
    ShiftViewSet,
)

router = DefaultRouter()

router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path("me/", MyAttendanceProfileView.as_view(), name="my-attendance-profile"),
    path("notifications/", AttendanceNotificationListView.as_view(), name="notifications"),
] + router.urls
