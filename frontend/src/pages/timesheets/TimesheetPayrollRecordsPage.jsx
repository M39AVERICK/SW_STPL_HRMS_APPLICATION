import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save, WalletCards } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";

export default function TimesheetPayrollRecordsPage() {
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("timesheets/payroll-records/");
      setItems(data);
      setDrafts(Object.fromEntries(data.map((item) => [item.id, {
        days: item.payroll_days ?? "", hours: item.payroll_hours ?? "", note: item.payroll_note ?? "",
      }])));
    } catch (error) { toast.error(error.response?.data?.detail || "Could not load finance records."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, [load]);
  const edit = (id, key, value) => setDrafts((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));
  async function save(item) {
    setSaving(item.id);
    try { await API.patch(`timesheets/payroll-records/${item.id}/`, {
      payroll_days: drafts[item.id].days, payroll_hours: drafts[item.id].hours, payroll_note: drafts[item.id].note,
    }); toast.success("Payroll record saved."); await load(); }
    catch (error) { toast.error(error.response?.data?.payroll?.[0] || error.response?.data?.detail || "Could not save payroll record."); }
    finally { setSaving(null); }
  }
  return <main className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">HR / Admin records</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Finance & payroll records</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">Review approver and Finance processing activity. Once Finance marks a week processed, record payroll work days and hours for internal records.</p></div><button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/>Refresh</button></header>
    {loading ? <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">Loading records…</div> : items.length === 0 ? <div className="rounded-2xl border bg-white p-12 text-center"><WalletCards size={34} className="mx-auto text-slate-300"/><h2 className="mt-3 font-semibold">No Finance records yet</h2><p className="mt-1 text-sm text-slate-500">Approver approved weeks will appear here when sent to Finance.</p></div> : <section className="space-y-4">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap justify-between gap-4 border-b p-5"><div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Processed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{item.status}</span><h2 className="mt-2 text-lg font-bold">{item.employee_name} · {item.employee_id}</h2><p className="text-sm text-slate-600">{item.client_name} · {item.project_name} · Week {item.week_start} – {item.week_end}</p><p className="mt-1 text-xs text-slate-500">Approver: {item.approver_name || "—"}{item.finance_processor_name ? ` · Finance: ${item.finance_processor_name}` : ""}{item.finance_processed_at ? ` · Processed ${new Date(item.finance_processed_at).toLocaleString("en-IN")}` : ""}</p></div><div className="text-right text-sm"><p>Finance reference</p><p className="font-semibold">{item.finance_reference || "Not provided"}</p></div></header>
      <div className="grid gap-4 p-5 md:grid-cols-3"><label className="text-sm font-medium">Payroll days<input type="number" min="0" max="7" value={drafts[item.id]?.days ?? ""} onChange={(e) => edit(item.id, "days", e.target.value)} disabled={item.status !== "Processed"} className="mt-1 w-full rounded-lg border px-3 py-2"/></label><label className="text-sm font-medium">Payroll hours<input type="number" min="0" max="168" step="0.25" value={drafts[item.id]?.hours ?? ""} onChange={(e) => edit(item.id, "hours", e.target.value)} disabled={item.status !== "Processed"} className="mt-1 w-full rounded-lg border px-3 py-2"/></label><label className="text-sm font-medium">Internal note<input value={drafts[item.id]?.note ?? ""} onChange={(e) => edit(item.id, "note", e.target.value)} disabled={item.status !== "Processed"} className="mt-1 w-full rounded-lg border px-3 py-2"/></label></div>
      {item.payroll_recorded_at && <p className="px-5 pb-3 text-xs text-slate-500">Last recorded by {item.payroll_recorder_name || "HR/Admin"} · {new Date(item.payroll_recorded_at).toLocaleString("en-IN")}</p>}
      <footer className="flex items-center justify-between gap-3 border-t bg-slate-50 px-5 py-3"><p className="text-xs text-slate-500">Payroll figures are for records only and do not alter the employee timesheet.</p>{item.status === "Processed" && <button onClick={() => save(item)} disabled={saving === item.id} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save size={15}/>{saving === item.id ? "Saving…" : "Save record"}</button>}</footer></article>)}</section>}
  </main>;
}
