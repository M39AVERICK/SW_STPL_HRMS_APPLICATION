from django.contrib import admin
from django.db import models
from .models import (Client, Project, EmployeeProjectAssignment, TimesheetPeriod, TimesheetRevision, TimesheetEntry, TimesheetAttachment)

admin.site.register(Client)
admin.site.register(Project)   
admin.site.register(EmployeeProjectAssignment)
admin.site.register(TimesheetPeriod)
admin.site.register(TimesheetRevision)
admin.site.register(TimesheetEntry)
admin.site.register(TimesheetAttachment)

# Register your models here.
