# po_app/models.py
from django.db import models

class Vendor(models.Model):
    name = models.CharField(max_length=100)
    gst = models.CharField(max_length=20)
    address = models.TextField()
    def __str__(self):
        return self.name

class Customer(models.Model):
    name = models.CharField(max_length=100)
    gst = models.CharField(max_length=20)
    address = models.TextField()
    def __str__(self):
        return self.name

class PurchaseOrder(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    subtotal = models.FloatField()
    gst = models.FloatField()
    tds = models.FloatField()
    total = models.FloatField()
    date=models.DateField(default="2026-04-03")
    created_at = models.DateTimeField(auto_now_add=True)
    excel_file = models.FileField(upload_to='po_excels/', null=True, blank=True)


    def __str__(self):
        return f"PO-{self.id}"
    

class Resource(models.Model):
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='resources')
    name = models.CharField(max_length=100)
    rate = models.FloatField()
    hours = models.FloatField()
    def __str__(self):
        return self.name