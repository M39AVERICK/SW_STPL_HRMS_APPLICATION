from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("HR_APP", "0004_remove_employee_location_remove_employee_name_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="employee",
            name="attendance_category",
            field=models.CharField(
                choices=[("In-house", "In-house"), ("On-site", "On-site")],
                default="In-house",
                max_length=20,
            ),
        ),
    ]
