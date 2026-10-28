from django.db import migrations


def route_approved_revisions_to_finance(apps, schema_editor):
    revision = apps.get_model("Timesheet", "TimesheetRevision")
    revision.objects.filter(status="Approved").update(status="Finance Pending")


class Migration(migrations.Migration):
    dependencies = [
        ("Timesheet", "0003_timesheetrevision_finance_processed_at_and_more"),
    ]

    operations = [
        migrations.RunPython(route_approved_revisions_to_finance, migrations.RunPython.noop),
    ]
