import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, RefreshCw, Search } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";

const STATUS_OPTIONS = [
  "Present",
  "Absent",
  "Half Day",
  "Leave",
  "Holiday",
  "Weekend",
  "Work From Home",
];

const NO_PUNCH_STATUSES = new Set(["Absent", "Leave", "Holiday", "Weekend"]);

function todayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function emptyForm() {
  return {
    employee: "",
    attendance_date: todayLocalDate(),
    shift: "",
    check_in: "",
    check_out: "",
    status: "Present",
    remarks: "",
  };
}

function asList(data) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
}

function errorMessage(error) {
  const payload = error?.response?.data?.errors ?? error?.response?.data;
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    return Object.entries(payload)
      .map(([field, messages]) => {
        const message = Array.isArray(messages) ? messages.join(" ") : String(messages);
        return `${field}: ${message}`;
      })
      .join("\n");
  }
  return "Could not save attendance. Please try again.";
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatDuration(value) {
  if (!value) return "—";
  const match = String(value).match(/^(?:(\d+)\s+)?(\d{1,2}):(\d{2}):(\d{2})/);
  if (!match) return String(value);
  const totalHours = Number(match[1] || 0) * 24 + Number(match[2]);
  return `${totalHours}h ${match[3]}m`;
}

function minutesLabel(value) {
  const minutes = Number(value || 0);
  return minutes ? `${minutes} min` : "—";
}

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [employeeResponse, shiftResponse, attendanceResponse] = await Promise.all([
        API.get("hr/employees/"),
        API.get("attendance/shifts/"),
        API.get("attendance/?work_location=Office"),
      ]);
      setEmployees(asList(employeeResponse.data));
      setShifts(asList(shiftResponse.data));
      setRecords(asList(attendanceResponse.data));
    } catch (error) {
      console.error(error);
      toast.error("Could not load attendance data. Check that the API server is running and you are signed in.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((record) => {
      const employeeMatch =
        !term ||
        String(record.employee_name || "").toLowerCase().includes(term) ||
        String(record.employee || "").includes(term);
      const dateMatch = !dateFilter || record.attendance_date === dateFilter;
      const statusMatch = !statusFilter || record.status === statusFilter;
      return employeeMatch && dateMatch && statusMatch;
    });
  }, [records, search, dateFilter, statusFilter]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "status" && NO_PUNCH_STATUSES.has(value)) {
        next.check_in = "";
        next.check_out = "";
      }
      return next;
    });
  }

  async function submitAttendance(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        employee: Number(form.employee),
        attendance_date: form.attendance_date,
        work_location: "Office",
        shift: form.shift ? Number(form.shift) : null,
        // datetime-local values are interpreted in Django's configured TIME_ZONE.
        check_in: form.check_in || null,
        check_out: form.check_out || null,
        status: form.status,
        remarks: form.remarks.trim() || "",
      };
      await API.post("attendance/", payload);
      toast.success("Attendance saved. Calculated values came from the server.");
      setForm(emptyForm());
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(errorMessage(error), { autoClose: 6000 });
    } finally {
      setSaving(false);
    }
  }

  const noPunches = NO_PUNCH_STATUSES.has(form.status);

  return (
    <main className="min-h-full bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              People operations
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Attendance
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Record employee attendance and review server-calculated hours and exceptions.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.5fr)]">
          <form onSubmit={submitAttendance} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><CalendarDays size={20} /></div>
              <div>
                <h2 className="font-semibold text-slate-900">Record attendance</h2>
                <p className="text-xs text-slate-500">Calculated totals are filled in after saving.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Employee <span className="text-rose-500">*</span>
                <select name="employee" value={form.employee} onChange={updateField} required className={inputClass}>
                  <option value="">Select an employee</option>
                  {employees.filter((employee) => !employee.attendance_category || employee.attendance_category === "In-house").map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.employee_id} · {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Attendance date <span className="text-rose-500">*</span>
                  <input type="date" name="attendance_date" value={form.attendance_date} onChange={updateField} required className={inputClass} />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Status <span className="text-rose-500">*</span>
                  <select name="status" value={form.status} onChange={updateField} required className={inputClass}>
                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Shift
                <select name="shift" value={form.shift} onChange={updateField} className={inputClass}>
                  <option value="">No shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} · {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Check-in
                  <input type="datetime-local" name="check_in" value={form.check_in} onChange={updateField} disabled={noPunches} className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`} />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Check-out
                  <input type="datetime-local" name="check_out" value={form.check_out} onChange={updateField} disabled={noPunches} className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`} />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Remarks
                <textarea name="remarks" value={form.remarks} onChange={updateField} rows={2} maxLength={2000} className={inputClass} placeholder="Optional note for HR" />
              </label>

              <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                Punch times use the timezone configured in Django. Choose the correct company timezone before relying on late or overtime calculations.
              </p>

              <button type="submit" disabled={saving || loading || !employees.length} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                <Clock3 size={17} />
                {saving ? "Saving…" : "Save attendance"}
              </button>
            </div>
          </form>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">Attendance records</h2>
                  <p className="mt-1 text-xs text-slate-500">{visibleRecords.length} record{visibleRecords.length === 1 ? "" : "s"}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="relative">
                    <span className="sr-only">Search employee</span>
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
                  </label>
                  <input aria-label="Filter by date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-900px w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Employee / Date</th>
                    <th className="px-5 py-3 font-semibold">Shift</th>
                    <th className="px-5 py-3 font-semibold">Punches</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Worked</th>
                    <th className="px-5 py-3 font-semibold">Exceptions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">Loading attendance…</td></tr>
                  ) : visibleRecords.length === 0 ? (
                    <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">No attendance records match these filters.</td></tr>
                  ) : visibleRecords.map((record) => {
                    const shift = shifts.find((item) => item.id === record.shift);
                    return (
                      <tr key={record.id} className="align-top hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">{record.employee_name || `Employee #${record.employee}`}</div>
                          <div className="mt-1 text-xs text-slate-500">{record.attendance_date}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{shift?.name || "—"}</td>
                        <td className="px-5 py-4 text-slate-600">{formatTime(record.check_in)} → {formatTime(record.check_out)}</td>
                        <td className="px-5 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{record.status}</span></td>
                        <td className="px-5 py-4 font-medium text-slate-700">{formatDuration(record.working_hours)}</td>
                        <td className="px-5 py-4 text-xs leading-5 text-slate-600">
                          {record.late_minutes > 0 && <div>Late: {minutesLabel(record.late_minutes)}</div>}
                          {record.early_leave_minutes > 0 && <div>Early: {minutesLabel(record.early_leave_minutes)}</div>}
                          {record.overtime_minutes > 0 && <div>Overtime: {minutesLabel(record.overtime_minutes)}</div>}
                          {!record.late_minutes && !record.early_leave_minutes && !record.overtime_minutes && <span>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
