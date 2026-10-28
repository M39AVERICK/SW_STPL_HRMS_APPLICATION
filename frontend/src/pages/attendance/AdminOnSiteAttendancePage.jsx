import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Clock3, LogOut, RefreshCw, Search } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";

const today = () => new Date().toLocaleDateString("en-CA");
const localDateTime = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};
const list = (data) => Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function errorText(error) {
  const data = error?.response?.data;
  const detail = data?.errors ?? data?.detail ?? data;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    return Object.entries(detail).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : value}`).join("\n");
  }
  return "Could not save attendance. Please try again.";
}

function punch(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminOnSiteAttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ employee: "", assignment: "", shift: "", attendance_date: today(), check_in: localDateTime(), check_out: "" });
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [employeesResponse, assignmentsResponse, shiftsResponse, recordsResponse] = await Promise.all([
        API.get("hr/employees/"),
        API.get("timesheets/assignments/"),
        API.get("attendance/shifts/"),
        API.get("attendance/?work_location=Client%20Site"),
      ]);
      setEmployees(list(employeesResponse.data).filter((employee) => employee.attendance_category === "On-site"));
      setAssignments(list(assignmentsResponse.data));
      setShifts(list(shiftsResponse.data));
      setRecords(list(recordsResponse.data));
    } catch (error) {
      console.error(error);
      toast.error("Could not load on-site attendance data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const validAssignments = assignments.filter((assignment) =>
    String(assignment.employee) === form.employee && assignment.is_active &&
    assignment.start_date <= form.attendance_date && (!assignment.end_date || assignment.end_date >= form.attendance_date),
  );
  const nextEmployeeAssignment = assignments
    .filter((assignment) => String(assignment.employee) === form.employee && assignment.is_active && assignment.start_date > form.attendance_date)
    .sort((left, right) => left.start_date.localeCompare(right.start_date))[0];
  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch = !term || `${record.employee_name} ${record.project_name} ${record.client_name} ${record.site_name}`.toLowerCase().includes(term);
      return matchesSearch && (!dateFilter || record.attendance_date === dateFilter);
    });
  }, [records, search, dateFilter]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value, ...(name === "employee" || name === "attendance_date" ? { assignment: "" } : {}) }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await API.post("attendance/", {
        employee: Number(form.employee),
        attendance_date: form.attendance_date,
        work_location: "Client Site",
        project_assignment: Number(form.assignment),
        shift: form.shift ? Number(form.shift) : null,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
        status: "Present",
      });
      toast.success("On-site attendance saved.");
      setForm({ employee: "", assignment: "", shift: "", attendance_date: today(), check_in: localDateTime(), check_out: "" });
      await loadData();
    } catch (error) {
      toast.error(errorText(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
    }
  }

  async function checkOut(record) {
    setSaving(true);
    try {
      await API.patch(`attendance/${record.id}/`, { check_out: localDateTime() });
      toast.success(`Checked out ${record.employee_name}.`);
      await loadData();
    } catch (error) {
      toast.error(errorText(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-full bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">People operations</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">On-site attendance</h1>
            <p className="mt-2 text-sm text-slate-500">Record and review client-site attendance for employees categorized as On-site.</p>
          </div>
          <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.5fr)]">
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Building2 size={20} /></span><div><h2 className="font-semibold text-slate-900">Record client-site attendance</h2><p className="text-xs text-slate-500">Only active assignments covering the selected date are available.</p></div></div>
            <label className="block text-sm font-medium text-slate-700">On-site employee
              <select name="employee" value={form.employee} onChange={updateForm} required className={inputClass}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employee_id} · {employee.full_name || `${employee.first_name} ${employee.last_name}`}</option>)}</select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Attendance date
              <input name="attendance_date" type="date" value={form.attendance_date} onChange={updateForm} required max={today()} className={inputClass} />
            </label>
            <label className="block text-sm font-medium text-slate-700">Client project assignment
              <select name="assignment" value={form.assignment} onChange={updateForm} required disabled={!form.employee} className={inputClass}><option value="">Select matching assignment</option>{validAssignments.map((item) => <option key={item.id} value={item.id}>{item.project_name} · {item.client_name} · {item.site_name || "Client site"}</option>)}</select>
            </label>
            {form.employee && !validAssignments.length && <p className="-mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{nextEmployeeAssignment ? `This employee's next assignment starts ${nextEmployeeAssignment.start_date}. Attendance cannot be entered before the assignment starts.` : "No active assignment covers this date. Check the employee's project assignment dates and status."}</p>}
            <label className="block text-sm font-medium text-slate-700">Shift <span className="font-normal text-slate-400">(optional)</span>
              <select name="shift" value={form.shift} onChange={updateForm} className={inputClass}><option value="">No shift selected</option>{shifts.filter((shift) => shift.is_active).map((shift) => <option key={shift.id} value={shift.id}>{shift.name} · {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}</option>)}</select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Check-in<input name="check_in" type="datetime-local" value={form.check_in} onChange={updateForm} required className={inputClass} /></label>
              <label className="block text-sm font-medium text-slate-700">Check-out <span className="font-normal text-slate-400">(optional)</span><input name="check_out" type="datetime-local" value={form.check_out} onChange={updateForm} className={inputClass} /></label>
            </div>
            {!loading && !employees.length && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">No employees are categorized as On-site. Update employee attendance categories first.</p>}
            <button type="submit" disabled={saving || loading || !employees.length || !validAssignments.length} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><Clock3 size={17} />{saving ? "Saving…" : "Save on-site attendance"}</button>
          </form>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 md:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-semibold text-slate-900">Client-site records</h2><p className="mt-1 text-xs text-slate-500">{visibleRecords.length} record{visibleRecords.length === 1 ? "" : "s"}</p></div><div className="grid gap-2 sm:grid-cols-2"><label className="relative"><span className="sr-only">Search employees and projects</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee or project" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"/></label><input aria-label="Filter by attendance date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"/></div></div></div>
            <div className="overflow-x-auto"><table className="min-w-[950px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Employee / Date</th><th className="px-4 py-3">Client / Project</th><th className="px-4 py-3">Punches</th><th className="px-4 py-3">Worked</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan="6" className="p-10 text-center text-slate-500">Loading records…</td></tr> : visibleRecords.length === 0 ? <tr><td colSpan="6" className="p-10 text-center text-slate-500">No on-site records match those filters.</td></tr> : visibleRecords.map((record) => <tr key={record.id} className="hover:bg-slate-50"><td className="px-4 py-4"><div className="font-semibold text-slate-800">{record.employee_name}</div><div className="mt-1 text-xs text-slate-500">{record.attendance_date}</div></td><td className="px-4 py-4"><div className="font-medium text-slate-800">{record.project_name || "Client site"}</div><div className="text-xs text-slate-500">{record.client_name} · {record.site_name}</div></td><td className="px-4 py-4 text-xs text-slate-600">{punch(record.check_in)}<br/>{punch(record.check_out)}</td><td className="px-4 py-4 text-slate-700">{record.working_hours || "—"}</td><td className="px-4 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{record.status}</span></td><td className="px-4 py-4">{record.check_in && !record.check_out ? <button type="button" onClick={() => checkOut(record)} disabled={saving} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"><LogOut size={14}/> Check out</button> : <span className="text-xs text-slate-400">Complete</span>}</td></tr>)}</tbody></table></div>
          </section>
        </section>
      </div>
    </main>
  );
}
