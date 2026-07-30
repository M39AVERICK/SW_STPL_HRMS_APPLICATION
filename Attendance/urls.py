from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, ShiftViewSet

router = DefaultRouter()

router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'', AttendanceViewSet, basename='attendance')

urlpatterns = router.urls