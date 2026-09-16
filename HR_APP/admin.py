from django.contrib import admin
from .models import Department, Employee, BankDetail, EmployeeExtra,EmployeeDocument

admin.site.register(Department)
admin.site.register(Employee)
admin.site.register(BankDetail)
admin.site.register(EmployeeExtra)
@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(admin.ModelAdmin):

    list_display = (
        "employee",
        "resume",
        "offer_letter",
        "pan_document",
        "aadhaar_document",
        "experience_certificate",
        "other_document",
    )

    search_fields = (
        "employee__employee_id",
        "employee__first_name",
        "employee__last_name",
    )

# Register your models here.
