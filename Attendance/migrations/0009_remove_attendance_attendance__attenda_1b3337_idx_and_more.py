# Generated migration: preserve existing time-only punches as datetimes.
import datetime
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from django.db.models import F, Q
from django.utils import timezone


def convert_punches_forward(apps, schema_editor):
    Attendance = apps.get_model("Attendance", "Attendance")
    alias = schema_editor.connection.alias
    tz = timezone.get_default_timezone()

    for record in Attendance.objects.using(alias).iterator():
        check_in = record.check_in
        check_out = record.check_out
        if check_in is not None:
            record.check_in_datetime = timezone.make_aware(
                datetime.datetime.combine(record.attendance_date, check_in), tz
            )
        if check_out is not None:
            checkout_date = record.attendance_date
            if check_in is not None and check_out < check_in:
                checkout_date += datetime.timedelta(days=1)
            record.check_out_datetime = timezone.make_aware(
                datetime.datetime.combine(checkout_date, check_out), tz
            )
            if (
                record.check_in_datetime is not None
                and record.check_out_datetime <= record.check_in_datetime
            ):
                raise RuntimeError(
                    f"Attendance {record.pk} has checkout not later than check-in; "
                    "correct that record before applying this migration."
                )
        record.save(
            using=alias,
            update_fields=["check_in_datetime", "check_out_datetime"],
        )


def convert_punches_backward(apps, schema_editor):
    Attendance = apps.get_model("Attendance", "Attendance")
    alias = schema_editor.connection.alias
    tz = timezone.get_default_timezone()

    for record in Attendance.objects.using(alias).iterator():
        if record.check_in_datetime is not None:
            record.check_in = timezone.localtime(record.check_in_datetime, tz).time().replace(tzinfo=None)
        if record.check_out_datetime is not None:
            record.check_out = timezone.localtime(record.check_out_datetime, tz).time().replace(tzinfo=None)
        record.save(using=alias, update_fields=["check_in", "check_out"])


class Migration(migrations.Migration):
    dependencies = [
        ("Attendance", "0008_rename_early_departure_minutes_attendance_early_leave_minutes_and_more"),
        ("HR_APP", "0004_remove_employee_location_remove_employee_name_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="attendance",
            name="check_in_datetime",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="attendance",
            name="check_out_datetime",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(convert_punches_forward, convert_punches_backward),
        migrations.RemoveField(model_name="attendance", name="check_in"),
        migrations.RemoveField(model_name="attendance", name="check_out"),
        migrations.RenameField(
            model_name="attendance", old_name="check_in_datetime", new_name="check_in"
        ),
        migrations.RenameField(
            model_name="attendance", old_name="check_out_datetime", new_name="check_out"
        ),
        migrations.RemoveIndex(model_name="attendance", name="Attendance__attenda_1b3337_idx"),
        migrations.RemoveIndex(model_name="attendance", name="Attendance__employe_ed1505_idx"),
        migrations.RemoveIndex(model_name="attendance", name="Attendance__status_a972c3_idx"),
        migrations.AlterField(
            model_name="attendance",
            name="employee",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="attendance_records",
                to="HR_APP.employee",
            ),
        ),
        migrations.AlterField(
            model_name="attendance",
            name="shift",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="attendance_records",
                to="Attendance.shift",
            ),
        ),
        migrations.AlterField(
            model_name="shift",
            name="grace_minutes",
            field=models.PositiveSmallIntegerField(default=15),
        ),
        migrations.AddIndex(
            model_name="attendance",
            index=models.Index(fields=["attendance_date", "status"], name="Attendance__attenda_dc8030_idx"),
        ),
        migrations.AddConstraint(
            model_name="attendance",
            constraint=models.CheckConstraint(
                condition=Q(Q(check_in__isnull=True) | Q(check_out__isnull=True) | Q(check_out__gte=F("check_in"))),
                name="attendance_checkout_after_checkin",
            ),
        ),
    ]
