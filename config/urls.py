from django.contrib import admin
from django.urls import path, include

# ADD THESE TWO IMPORTS
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # 🔐 AUTH
    path('api/users/', include('ACCOUNTS.urls')),

    # 👨‍💼 HR MODULE
    path('api/hr/', include('HR_APP.urls')),

    # 🧾 PO MODULE (future)
    path('api/po/', include('po_app.urls')),

    # 🏢 Attendance MODULE
    path('api/attendance/', include('Attendance.urls')),
]

# ADD THIS BLOCK AT THE VERY BOTTOM
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )