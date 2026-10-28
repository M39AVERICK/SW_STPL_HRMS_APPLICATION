import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, FileText, RefreshCw, WalletCards } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";

function asList(data) {
  return Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
}

function errorText(error) {
  const data = error?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (data && typeof data === "object") return Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : value}`).join(" · ");
  return "Could not complete finance processing.";
}

async function downloadAttachment(file) {
  const response = await API.get(`timesheets/attachments/${file.id}/download/`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.file_name?.split("/").pop() || "timesheet.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

export default function FinanceProcessingPage() {
  const [items, setItems] = useState([]);
  const [references, setReferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("timesheets/finance/");
      setItems(asList(response.data));
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(load, 0);
    return () => window.clearTimeout(initialLoad);
  }, [load]);

  async function process(item) {
    setSavingId(item.id);
    try {
      await API.post(`timesheets/finance/${item.id}/`, { reference: references[item.id] || "" });
      toast.success("Timesheet marked as processed.");
      await load();
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setSavingId(null);
    }
  }

  return <main className="mx-auto max-w-6xl space-y-6 p-5 md:p-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Finance control</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Timesheets sent to Finance</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">These submissions have been approved by their assigned project approver. Check the records, then mark them processed with an optional payroll or finance reference.</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/>Refresh</button></header>
    {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading Finance queue…</div> : items.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><CheckCircle2 size={34} className="mx-auto text-emerald-500"/><h2 className="mt-3 font-semibold text-slate-800">No timesheets waiting for Finance</h2><p className="mt-1 text-sm text-slate-500">Approver-approved timesheets will appear here.</p></div> : <section className="space-y-4">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Sent by approver · {item.reviewed_at ? new Date(item.reviewed_at).toLocaleString("en-IN") : ""}</p><h2 className="mt-1 text-lg font-bold text-slate-900">{item.employee_name} · {item.employee_id}</h2><p className="mt-1 text-sm text-slate-600">{item.client_name} · {item.project_name}{item.site_name ? ` · ${item.site_name}` : ""}</p><p className="mt-1 text-xs text-slate-500">Week {item.week_start} – {item.week_end} · Approved by {item.approver_name || "assigned approver"}</p></div><div className="rounded-xl bg-emerald-50 px-4 py-3 text-right"><p className="text-xs text-emerald-700">Total hours</p><p className="text-xl font-bold text-emerald-900">{(item.entries || []).reduce((sum, entry) => sum + Number(entry.regular_hours || 0) + Number(entry.extra_hours || 0), 0).toFixed(2)}</p></div></header>
      <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]"><div><h3 className="text-sm font-semibold text-slate-800">Daily entries</h3><div className="mt-2 overflow-x-auto rounded-xl border border-slate-100"><table className="min-w-[520px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Regular</th><th className="px-3 py-2">Extra</th><th className="px-3 py-2">Description</th></tr></thead><tbody className="divide-y divide-slate-100">{(item.entries || []).map((entry) => <tr key={entry.id}><td className="px-3 py-3">{entry.work_date}</td><td className="px-3 py-3">{entry.regular_hours}h</td><td className="px-3 py-3">{entry.extra_hours}h</td><td className="px-3 py-3">{entry.work_description}</td></tr>)}</tbody></table></div></div><div><h3 className="text-sm font-semibold text-slate-800">Attached records</h3><div className="mt-2 space-y-2">{(item.attachments || []).map((file) => <button key={file.id} type="button" onClick={() => downloadAttachment(file).catch((error) => toast.error(errorText(error)))} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50"><span className="flex min-w-0 items-center gap-2"><FileText size={17} className="shrink-0 text-rose-600"/><span className="truncate text-sm text-slate-700">{file.file_name?.split("/").pop() || "Weekly PDF"}</span></span><Download size={16} className="shrink-0 text-blue-700"/></button>)}{item.reviewer_comment && <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Approver note: {item.reviewer_comment}</p>}</div></div></div>
      <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-medium text-slate-700">Finance / payroll reference (optional)<input value={references[item.id] || ""} onChange={(event) => setReferences((current) => ({ ...current, [item.id]: event.target.value }))} maxLength={100} placeholder="Voucher number, payroll batch, or payment reference" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"/></label><button type="button" onClick={() => process(item)} disabled={savingId === item.id} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><WalletCards size={17}/>{savingId === item.id ? "Saving…" : "Mark processed"}</button></footer>
    </article>)}</section>}
  </main>;
}
