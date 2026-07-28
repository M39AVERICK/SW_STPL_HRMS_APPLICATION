from django.urls import path
from .views import (
    VendorListCreateView,
    CustomerListCreateView,
    PurchaseOrderListCreateView,
    PurchaseOrderDetailView,
    VendorFilesView,DownloadPOView,DashboardView

)

urlpatterns = [
    path('vendors/', VendorListCreateView.as_view()),
    path('customers/', CustomerListCreateView.as_view()),
    path('po/', PurchaseOrderListCreateView.as_view()),
    path('po/<int:pk>/', PurchaseOrderDetailView.as_view()),
    path('vendor-files/<int:vendor_id>/files/', VendorFilesView.as_view()),
    path('download/<int:po_id>/', DownloadPOView.as_view()),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]