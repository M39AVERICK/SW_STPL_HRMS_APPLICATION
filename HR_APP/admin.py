from django.contrib import admin
from .models import Department, Employee, BankDetail, EmployeeExtra

admin.site.register(Department)
admin.site.register(Employee)
admin.site.register(BankDetail)
admin.site.register(EmployeeExtra)

# Register your models here.
