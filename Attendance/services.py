from datetime import datetime, timedelta


class AttendanceService:


    @staticmethod
    def combine_date_time(date, time):

        return datetime.combine(
            date,
            time
        )


    @staticmethod
    def calculate_working_hours(attendance):

        if not attendance.check_in or not attendance.check_out:
            return None


        start = AttendanceService.combine_date_time(
            attendance.attendance_date,
            attendance.check_in
        )


        end = AttendanceService.combine_date_time(
            attendance.attendance_date,
            attendance.check_out
        )


        # Night shift handling

        if end < start:
            end += timedelta(days=1)


        return end - start



    @staticmethod
    def calculate_late(attendance):

        if not attendance.check_in:
            return False,0


        shift_start = AttendanceService.combine_date_time(
            attendance.attendance_date,
            attendance.shift.start_time
        )


        check_in = AttendanceService.combine_date_time(
            attendance.attendance_date,
            attendance.check_in
        )


        difference = int(
            (check_in-shift_start).total_seconds()/60
        )


        if difference > attendance.shift.grace_minutes:

            return True,difference


        return False,0



    @staticmethod
    def calculate_overtime(attendance):

        if not attendance.check_out:
            return False,0


        shift_end = AttendanceService.combine_date_time(
            attendance.attendance_date,
            attendance.shift.end_time
        )


        checkout = AttendanceService.combine_date_time(
            attendance.attendance_date,
            attendance.check_out
        )


        if checkout < attendance.shift.start_time:
            checkout += timedelta(days=1)



        overtime = int(
            (checkout-shift_end).total_seconds()/60
        )


        if overtime > 0:
            return True,overtime


        return False,0



    @staticmethod
    def process_attendance(attendance):


        attendance.working_hours = (
            AttendanceService.calculate_working_hours(
                attendance
            )
        )


        attendance.is_late, attendance.late_minutes = (
            AttendanceService.calculate_late(
                attendance
            )
        )


        attendance.is_overtime, attendance.overtime_minutes = (
            AttendanceService.calculate_overtime(
                attendance
            )
        )


        return attendance