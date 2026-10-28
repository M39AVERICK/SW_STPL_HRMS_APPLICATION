import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Attendance", "0010_remove_attendance_attendance_checkout_after_checkin_and_more"),
        ("HR_APP", "0005_employee_attendance_category"),
        ("Timesheet", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="attendance",
            name="work_location",
            field=models.CharField(
                choices=[("Office", "Office"), ("Client Site", "Client Site"), ("Remote", "Remote")],
                default="Office",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="attendance",
            name="project_assignment",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="attendance_records",
                to="Timesheet.employeeprojectassignment",
            ),
        ),
    ]
