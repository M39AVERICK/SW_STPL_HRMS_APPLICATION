from django.contrib import admin

from .models import Vendor, Customer, PurchaseOrder, Resource
admin.site.register(Vendor)
admin.site.register(Customer)
admin.site.register(PurchaseOrder)
admin.site.register(Resource)

# Register your models here.
