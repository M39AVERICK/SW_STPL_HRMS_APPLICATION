import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Clock3, LogIn, LogOut, MapPin, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";

function asList(data) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
}

function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function localDateValue(date = new Date()) {
  return localDateTimeValue(date).slice(0, 10);
}

function formatPunch(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function readableError(error) {
  const data = error?.response?.data;
  const detail = data?.errors ?? data?.detail ?? data;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    return Object.entries(detail)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(" ") : messages}`)
      .join("\n");
  }
  return "Could not save your attendance. Please try again.";
}

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function OnSiteAttendancePage() {
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [records, setRecords] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileResponse, assignmentResponse, shiftResponse, attendanceResponse] = await Promise.all([
        API.get("attendance/me/"),
        API.get("timesheets/assignments/"),
        API.get("attendance/shifts/"),
        API.get("attendance/"),
      ]);
      setProfile(profileResponse.data);
      const nextAssignments = asList(assignmentResponse.data);
      setAssignments(nextAssignments);
      setShifts(asList(shiftResponse.data));
      setRecords(asList(attendanceResponse.data));
      const today = localDateValue();
      const eligible = nextAssignments.filter((item) =>
        item.is_active && item.start_date <= today && (!item.end_date || item.end_date >= today),
      );
      setAssignmentId((current) => current || String(eligible[0]?.id || ""));
    } catch (error) {
      console.error(error);
      toast.error("Could not load on-site attendance. Please check your connection and sign-in.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const employeeId = profile?.id;
  const isOnSiteEmployee = profile?.attendance_category === "On-site";
  const attendanceLabel = profile ? (isOnSiteEmployee ? "site" : "in-house") : "attendance";
  const workLocation = isOnSiteEmployee ? "Client Site" : "Office";
  const myDayRecords = useMemo(
    () => records.filter((record) => Number(record.employee) === Number(employeeId)),
    [records, employeeId],
  );
  const myRecords = myDayRecords.filter((record) => record.work_location === workLocation);
  const openRecord = myRecords.find((record) => record.check_in && !record.check_out);
  const todayRecord = myDayRecords.find((record) => record.attendance_date === localDateValue());
  const selectedAssignment = assignments.find((item) => String(item.id) === assignmentId);
  const today = localDateValue();
  const eligibleAssignments = assignments.filter((item) =>
    item.is_active && item.start_date <= today && (!item.end_date || item.end_date >= today),
  );
  const nextAssignment = assignments
    .filter((item) => item.is_active && item.start_date > today)
    .sort((left, right) => left.start_date.localeCompare(right.start_date))[0];

  async function checkIn(event) {
    event.preventDefault();
    if (isOnSiteEmployee && !selectedAssignment) {
      toast.error("Choose an active client project before checking in.");
      return;
    }
    setSaving(true);
    try {
      await API.post("attendance/", {
        attendance_date: localDateValue(),
        ...(isOnSiteEmployee ? { project_assignment: Number(selectedAssignment.id) } : {}),
        shift: shiftId ? Number(shiftId) : null,
        check_in: localDateTimeValue(),
      });
      toast.success(`You are checked in${isOnSiteEmployee ? " at the client site" : " at the office"}.`);
      await loadData();
    } catch (error) {
      toast.error(readableError(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
    }
  }

  async function checkOut() {
    if (!openRecord) return;
    setSaving(true);
    try {
      await API.patch(`attendance/${openRecord.id}/`, {
        check_out: localDateTimeValue(),
      });
      toast.success("You are checked out. Your worked time has been calculated.");
      await loadData();
    } catch (error) {
      toast.error(readableError(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
    }
  }

  const blockedByExistingRecord = !openRecord && todayRecord;

  return (
    <main className="min-h-full bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Employee self-service</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{isOnSiteEmployee ? "On-site attendance" : "My attendance"}</h1>
            <p className="mt-2 text-sm text-slate-500">Check in and out using your employee attendance category. Your attendance is saved against your employee profile.</p>
          </div>
          <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-60">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form onSubmit={checkIn} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><MapPin size={20} /></div>
              <div>
                <h2 className="font-semibold text-slate-900">Today’s {isOnSiteEmployee ? "site visit" : "attendance"}</h2>
                <p className="text-xs text-slate-500">{new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date())}</p>
              </div>
            </div>

            {loading ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Loading your attendance profile…</p>
            ) : !profile ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900">
                Your login is not linked to an employee record. Please contact HR to link your account.
              </div>
            ) : isOnSiteEmployee && !eligibleAssignments.length ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                {nextAssignment
                  ? `Your next client assignment starts ${nextAssignment.start_date}. You can check in on or after that date; future attendance cannot be recorded.`
                  : assignments.length
                    ? "No active client assignment covers today. Please ask HR to check the assignment status and dates."
                    : "No client project is linked to your account yet. Please contact HR to add your assignment before checking in."}
              </div>
            ) : (
              <div className="space-y-4">
                {isOnSiteEmployee && <label className="block text-sm font-medium text-slate-700">
                  Assigned client project
                  <select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)} disabled={Boolean(openRecord) || !eligibleAssignments.length} required className={inputClass}>
                    <option value="">Choose an active assignment</option>
                    {eligibleAssignments.map((item) => (
                      <option key={item.id} value={item.id}>{item.project_name} · {item.client_name}</option>
                    ))}
                  </select>
                </label>}

                {isOnSiteEmployee && selectedAssignment && (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-semibold text-slate-800"><Building2 size={16} /> {selectedAssignment.client_name}</div>
                    <div className="mt-2">{selectedAssignment.site_name || "Client site"}</div>
                    <div className="mt-1">Project approver: <span className="font-medium text-slate-800">{selectedAssignment.approver_name || "Ask HR to assign an approver"}</span>{selectedAssignment.approver_email ? ` · ${selectedAssignment.approver_email}` : ""}</div>
                    <div className="mt-1 text-xs text-slate-500">Assignment: {selectedAssignment.start_date}{selectedAssignment.end_date ? ` – ${selectedAssignment.end_date}` : " – ongoing"}</div>
                  </div>
                )}

                <label className="block text-sm font-medium text-slate-700">
                  Shift <span className="font-normal text-slate-400">(optional)</span>
                  <select value={shiftId} onChange={(event) => setShiftId(event.target.value)} disabled={Boolean(openRecord)} className={inputClass}>
                    <option value="">No shift selected</option>
                    {shifts.filter((shift) => shift.is_active).map((shift) => (
                      <option key={shift.id} value={shift.id}>{shift.name} · {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}</option>
                    ))}
                  </select>
                </label>

                {openRecord ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <div className="font-semibold">You’re checked in</div>
                      <div className="mt-1">Since {formatPunch(openRecord.check_in)}</div>
                    </div>
                    <button type="button" onClick={checkOut} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
                      <LogOut size={17} /> {saving ? "Saving…" : "Check out"}
                    </button>
                  </div>
                ) : blockedByExistingRecord ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    Attendance is already recorded for today ({blockedByExistingRecord.work_location}). This system allows one attendance record per employee per day. Contact HR if this record needs correction.
                  </div>
                ) : (
                  <button type="submit" disabled={saving || !eligibleAssignments.length} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                    <LogIn size={17} /> {saving ? "Saving…" : isOnSiteEmployee ? "Check in at client site" : "Check in for in-house work"}
                  </button>
                )}
              </div>
            )}
          </form>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700"><Clock3 size={20} /></div>
                <div>
                  <h2 className="font-semibold text-slate-900">Your recent {attendanceLabel} records</h2>
                  <p className="mt-1 text-xs text-slate-500">{myRecords.length} record{myRecords.length === 1 ? "" : "s"}</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? <p className="p-6 text-sm text-slate-500">Loading attendance…</p> : myRecords.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">{profile ? `No ${attendanceLabel} attendance records yet.` : "Your attendance records will appear once HR links your employee login."}</p>
              ) : myRecords.slice(0, 8).map((record) => (
                <article key={record.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="font-semibold text-slate-800">{record.project_name || "In-house"}</div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{record.status}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{isOnSiteEmployee ? `${record.client_name || "Client"} · ${record.site_name || "Site"} · ` : "Office · "}{record.attendance_date}</div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <div>Check-in: <span className="font-medium text-slate-800">{formatPunch(record.check_in)}</span></div>
                    <div>Check-out: <span className="font-medium text-slate-800">{formatPunch(record.check_out)}</span></div>
                  </div>
                  {record.working_hours && <div className="mt-2 text-xs font-semibold text-emerald-700">Worked: {record.working_hours}</div>}
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
