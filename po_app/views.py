from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Vendor, Customer, PurchaseOrder
from .serializers import VendorSerializer, CustomerSerializer, PurchaseOrderSerializer
import os
from django.conf import settings
from .utils import generate_excel

# 🔹 Vendor APIs
class VendorListCreateView(ListCreateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    # permission_classes = [IsAuthenticated]


# 🔹 Customer APIs
class CustomerListCreateView(ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    # permission_classes = [IsAuthenticated]


# 🔹 PO APIs
class PurchaseOrderListCreateView(ListCreateAPIView):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # ✅ Save PO first
        po = serializer.save()

        # ✅ Generate Excel file
        save_excel_file(po)

class PurchaseOrderDetailView(RetrieveAPIView):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    # permission_classes = [IsAuthenticated]

def save_excel_file(po):
    wb = generate_excel(po)

    folder = os.path.join(settings.MEDIA_ROOT, "po_excels")
    os.makedirs(folder, exist_ok=True)

    file_path = os.path.join(folder, f"PO_{po.id}.xlsx")

    wb.save(file_path)

    po.excel_file = f"po_excels/PO_{po.id}.xlsx"
    po.save()
from rest_framework.views import APIView
from rest_framework.response import Response

class VendorFilesView(APIView):
    def get(self, request, vendor_id):
        pos = PurchaseOrder.objects.filter(vendor_id=vendor_id)

        data = []
        for po in pos:
            data.append({
                "id": po.id,
                "file": po.excel_file.url if po.excel_file else None,
                "date": po.date,
                "total": po.total
            })

        return Response(data)
    
from django.http import FileResponse


class DownloadPOView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, po_id):
        try:
            po = PurchaseOrder.objects.get(id=po_id)

            # 🔐 SECURITY CHECK
            # Only allow access if user is authorized
            # (basic version: allow all logged-in users)
            
            if not po.excel_file:
                return Response({"error": "File not found"}, status=404)

            return FileResponse(
                po.excel_file.open(),
                as_attachment=True,
                filename=f"PO_{po.id}.xlsx"
            )

        except PurchaseOrder.DoesNotExist:
            return Response({"error": "Invalid PO"}, status=404)
        

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from .models import PurchaseOrder

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_pos = PurchaseOrder.objects.count()
        pending = PurchaseOrder.objects.filter(status="Pending").count()
        approved = PurchaseOrder.objects.filter(status="Approved").count()
        rejected = PurchaseOrder.objects.filter(status="Rejected").count()

        total_spend = PurchaseOrder.objects.aggregate(
            total=Sum('total_amount')
        )['total'] or 0

        vendors = (
            PurchaseOrder.objects
            .values('vendor__name')
            .annotate(
                amount=Sum('total_amount'),
                orders=Count('id')
            )
            .order_by('-amount')[:5]
        )

        vendor_list = [
            {
                "name": v["vendor__name"],
                "amount": v["amount"],
                "orders": v["orders"]
            }
            for v in vendors
        ]

        recent_pos = PurchaseOrder.objects.order_by('-id')[:5]

        recent_list = [
            {
                "id": po.id,
                "vendor": po.vendor.name,
                "amount": po.total_amount,
                "status": po.status,
                "date": po.date.strftime("%d-%m-%Y")
            }
            for po in recent_pos
        ]

        return Response({
            "total_pos": total_pos,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "total_spend": total_spend,
            "vendors": vendor_list,
            "recent_pos": recent_list
        })