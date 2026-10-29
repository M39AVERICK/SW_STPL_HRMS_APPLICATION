import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CalendarDays, Download, FileUp, Plus, RefreshCw, Send, Sheet, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const list = (data) => Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

function mondayOf(date = new Date()) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result.toLocaleDateString("en-CA");
}

function errorText(error) {
  const data = error?.response?.data;
  const detail = data?.errors ?? data?.detail ?? data;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    return Object.entries(detail).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : value}`).join("\n");
  }
  return "Could not complete the timesheet action. Please try again.";
}

function statusLabel(status) {
  return {
    Submitted: "Awaiting project approver",
    Approved: "Approver approved · awaiting Finance",
    "Finance Pending": "Sent to Finance",
    Processed: "Approved · Finance processed",
    "Changes Requested": "Changes requested",
  }[status] || status || "Draft";
}

async function downloadAttachment(id, fileName) {
  const response = await API.get(`timesheets/attachments/${id}/download/`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "timesheet.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

export default function EmployeeTimesheetPage() {
  const [assignments, setAssignments] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [period, setPeriod] = useState(null);
  const [entries, setEntries] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [weekStart, setWeekStart] = useState(mondayOf());
  const [entry, setEntry] = useState({ work_date: new Date().toLocaleDateString("en-CA"), regular_hours: "8", extra_hours: "0", work_description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const activePeriodId = useRef(null);

  const assignmentsForEmployee = assignments.filter((item) => item.attendance_category === "On-site");
  const selectedAssignment = assignments.find((item) => String(item.id) === assignmentId);
  const revision = period?.latest_revision;
  const isDraft = revision?.status === "Draft";
  const dueDate = useMemo(() => {
    if (!weekStart) return "Saturday";
    const date = new Date(`${weekStart}T00:00:00`);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
  }, [weekStart]);

  const loadPeriods = useCallback(async () => {
    const [assignmentResponse, periodsResponse] = await Promise.all([
      API.get("timesheets/assignments/"),
      API.get("timesheets/periods/"),
    ]);
    const nextAssignments = list(assignmentResponse.data);
    setAssignments(nextAssignments);
    const nextPeriods = list(periodsResponse.data);
    setPeriods(nextPeriods);
    setAssignmentId((current) => current || String(nextAssignments.find((item) => item.attendance_category === "On-site" && item.is_active)?.id || nextPeriods[0]?.assignment || ""));
    return nextPeriods;
  }, []);

  const loadPeriod = useCallback(async (periodId) => {
    if (!periodId) {
      activePeriodId.current = null;
      setPeriod(null);
      setEntries([]);
      setAttachments([]);
      return;
    }
    const [periodResponse, entryResponse, attachmentResponse] = await Promise.all([
      API.get(`timesheets/periods/${periodId}/`),
      API.get(`timesheets/periods/${periodId}/entries/`),
      API.get(`timesheets/periods/${periodId}/attachments/`),
    ]);
    activePeriodId.current = periodId;
    setPeriod(periodResponse.data);
    setEntries(list(entryResponse.data));
    setAttachments(list(attachmentResponse.data));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextPeriods = await loadPeriods();
      const activeId = activePeriodId.current || nextPeriods[0]?.id;
      if (activeId) await loadPeriod(activeId);
    } catch (error) {
      console.error(error);
      toast.error("Could not load your timesheets. Check that your account has an active on-site project assignment.");
    } finally {
      setLoading(false);
    }
  }, [loadPeriods, loadPeriod]);

  useEffect(() => { refresh(); }, [refresh]);

  async function createOrOpenPeriod(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await API.post("timesheets/periods/", {
        assignment: Number(assignmentId),
        week_start: weekStart,
      });
      const nextPeriods = await loadPeriods();
      await loadPeriod(response.data.id || nextPeriods.find((item) => Number(item.assignment) === Number(assignmentId) && item.week_start === weekStart)?.id);
      toast.success("Weekly timesheet opened.");
    } catch (error) {
      toast.error(errorText(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
    }
  }

  async function saveEntry(event) {
    event.preventDefault();
    if (!period || !revision) return;
    setSaving(true);
    try {
      await API.post(`timesheets/periods/${period.id}/entries/`, entry);
      const response = await API.get(`timesheets/periods/${period.id}/entries/`);
      setEntries(list(response.data));
      setEntry((current) => ({ ...current, work_description: "" }));
      toast.success("Daily work entry saved.");
    } catch (error) {
      toast.error(errorText(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
    }
  }

  async function uploadPdf(event) {
    const file = event.target.files?.[0];
    if (!file || !period) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a PDF file.");
      event.target.value = "";
      return;
    }
    const body = new FormData();
    body.append("file", file);
    setSaving(true);
    try {
      await API.post(`timesheets/periods/${period.id}/attachments/`, body);
      const response = await API.get(`timesheets/periods/${period.id}/attachments/`);
      setAttachments(list(response.data));
      toast.success("PDF attached to this timesheet.");
    } catch (error) {
      toast.error(errorText(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  async function submitTimesheet() {
    if (!period) return;
    setSaving(true);
    try {
      await API.post(`timesheets/periods/${period.id}/submit/`);
      await loadPeriods();
      await loadPeriod(period.id);
      toast.success("Timesheet submitted to your project approver.");
    } catch (error) {
      toast.error(errorText(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
    }
  }

  async function startRevision() {
    if (!period) return;
    setSaving(true);
    try {
      await API.post(`timesheets/periods/${period.id}/start-revision/`);
      await loadPeriod(period.id);
      toast.success("A new draft revision is ready.");
    } catch (error) {
      toast.error(errorText(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
    }
  }

  const totalHours = entries.reduce((sum, item) => sum + Number(item.regular_hours || 0) + Number(item.extra_hours || 0), 0);

  return (
    <main className="min-h-full bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Employee self-service</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Weekly timesheet</h1><p className="mt-2 text-sm text-slate-500">Record your project hours, attach the required weekly PDF, and submit it for approval.</p></div>
          <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/> Refresh</button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.5fr)]">
          <div className="space-y-5">
            <form onSubmit={createOrOpenPeriod} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><CalendarDays size={20}/></span><div><h2 className="font-semibold text-slate-900">Open a week</h2><p className="text-xs text-slate-500">Submit by Saturday, {dueDate}.</p></div></div>
              <label className="block text-sm font-medium text-slate-700">Project assignment<select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)} required className={inputClass}><option value="">Select a project</option>{assignmentsForEmployee.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.project_name} · {item.client_name}</option>)}</select></label>
              {selectedAssignment?.approver_name && <p className="-mt-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">Your approver for this project is <strong>{selectedAssignment.approver_name}</strong> ({selectedAssignment.approver_email}).</p>}
              <label className="block text-sm font-medium text-slate-700">Week starting Monday<input type="date" value={weekStart} onChange={(event) => setWeekStart(event.target.value)} required className={inputClass}/></label>
              <button type="submit" disabled={saving || loading || !assignmentId} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Opening…" : "Open / continue this week"}</button>
              {!loading && !assignmentsForEmployee.length && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">No on-site project assignment is linked to your account. Contact HR.</p>}
            </form>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Your weeks</h2>{periods.length === 0 ? <p className="mt-3 text-sm text-slate-500">No timesheets created yet.</p> : <div className="mt-3 space-y-2">{periods.map((item) => <button key={item.id} type="button" onClick={() => loadPeriod(item.id)} className={`w-full rounded-xl border p-3 text-left transition ${period?.id === item.id ? "border-blue-300 bg-blue-50" : "border-slate-100 hover:bg-slate-50"}`}><span className="block text-sm font-semibold text-slate-800">{item.latest_revision?.project_name || assignments.find((assignment) => assignment.id === item.assignment)?.project_name || "Project"}</span><span className="mt-1 block text-xs text-slate-500">{item.week_start} – {item.week_end} · {statusLabel(item.latest_revision?.status)}</span></button>)}</div>}</section>
          </div>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            {!period ? <div className="flex min-h-56 flex-col items-center justify-center text-center"><Sheet size={32} className="text-slate-300"/><h2 className="mt-3 font-semibold text-slate-700">Choose or open a week</h2><p className="mt-1 max-w-md text-sm text-slate-500">Your daily hours and PDF attachment will appear here. The project approver and HR/admin can view them after submission.</p></div> : <>
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{statusLabel(period.latest_revision?.status)} · Revision {period.latest_revision?.revision_number || 1}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{period.latest_revision?.project_name || assignments.find((item) => item.id === period.assignment)?.project_name || "Weekly timesheet"}</h2><p className="mt-1 text-sm text-slate-500">{period.week_start} – {period.week_end}</p></div><div className="rounded-xl bg-slate-50 px-4 py-3 text-right"><div className="text-xs text-slate-500">Total hours</div><div className="text-xl font-bold text-slate-900">{totalHours.toFixed(2)}</div></div></header>

              {isDraft ? <>
                <form onSubmit={saveEntry} className="grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">Work date<input type="date" required min={period.week_start} max={new Date().toLocaleDateString("en-CA")} value={entry.work_date} onChange={(event) => setEntry({ ...entry, work_date: event.target.value })} className={inputClass}/></label>
                  <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium text-slate-700">Regular hours<input type="number" min="0" max="24" step="0.25" value={entry.regular_hours} onChange={(event) => setEntry({ ...entry, regular_hours: event.target.value })} className={inputClass}/></label><label className="text-sm font-medium text-slate-700">Extra hours<input type="number" min="0" max="24" step="0.25" value={entry.extra_hours} onChange={(event) => setEntry({ ...entry, extra_hours: event.target.value })} className={inputClass}/></label></div>
                  <label className="text-sm font-medium text-slate-700 md:col-span-2">Work completed<textarea required rows="2" maxLength="5000" value={entry.work_description} onChange={(event) => setEntry({ ...entry, work_description: event.target.value })} placeholder="Summarize the work completed for this date" className={inputClass}/></label>
                  <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 md:col-span-2"><Plus size={16}/> Save daily entry</button>
                </form>
              </> : <div className={`flex items-start gap-2 rounded-xl p-4 text-sm ${period.latest_revision?.status === "Processed" ? "bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-600"}`}><AlertCircle size={18} className={`mt-0.5 shrink-0 ${period.latest_revision?.status === "Processed" ? "text-emerald-600" : "text-blue-600"}`}/><span>{period.latest_revision?.status === "Processed" ? <>Your timesheet is approved. {period.latest_revision?.approver_name ? `Approved by ${period.latest_revision.approver_name}` : "Your project approver approved it"}{period.latest_revision?.reviewed_at ? ` on ${new Date(period.latest_revision.reviewed_at).toLocaleDateString("en-IN")}` : ""}. Finance has processed it{period.latest_revision?.finance_processed_at ? ` on ${new Date(period.latest_revision.finance_processed_at).toLocaleDateString("en-IN")}` : ""}.</> : <>This revision is {statusLabel(period.latest_revision?.status)}. Entries and files are locked while it is under review or approved.</>}</span></div>}

              <div><h3 className="font-semibold text-slate-800">Daily entries ({entries.length})</h3>{entries.length === 0 ? <p className="mt-2 text-sm text-slate-500">No daily work entries yet.</p> : <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">{entries.map((item) => <article key={item.id} className="grid gap-2 p-3 sm:grid-cols-[110px_120px_1fr]"><div className="text-sm font-semibold text-slate-800">{item.work_date}</div><div className="text-xs text-slate-600">Regular {item.regular_hours}h · Extra {item.extra_hours}h</div><p className="whitespace-pre-wrap text-sm text-slate-600">{item.work_description}</p></article>)}</div>}</div>

              <div><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-slate-800">Weekly PDF attachment ({attachments.length})</h3><p className="mt-1 text-xs text-slate-500">PDF only. The approver and HR/admin can open it after you submit.</p></div>{isDraft && <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FileUp size={16}/> Add PDF<input type="file" accept="application/pdf,.pdf" onChange={uploadPdf} disabled={saving} className="sr-only"/></label>}</div>{attachments.length === 0 ? <p className="mt-3 text-sm text-slate-500">Attach the weekly PDF before submitting.</p> : <div className="mt-3 space-y-2">{attachments.map((file) => <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><span className="truncate text-sm text-slate-700">{file.file_name?.split("/").pop()}</span><button type="button" onClick={() => downloadAttachment(file.id, file.file_name?.split("/").pop()).catch((error) => toast.error(errorText(error)))} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"><Download size={15}/> Download</button></div>)}</div>}</div>

              <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">{["Approved", "Changes Requested"].includes(period.latest_revision?.status) && <button type="button" onClick={startRevision} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Start correction</button>}{isDraft && <button type="button" onClick={submitTimesheet} disabled={saving || !entries.length || !attachments.length} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Send size={16}/>{saving ? "Submitting…" : "Submit for approval"}</button>}</footer>
            </>}
          </section>
        </section>
      </div>
    </main>
  );
}
