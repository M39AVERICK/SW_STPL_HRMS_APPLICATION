import { useCallback, useContext, useEffect, useState } from "react";
import { Check, Download, FileText, MessageSquareText, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";

function errorText(error) {
  const data = error?.response?.data;
  const detail = data?.errors ?? data?.detail ?? data;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") return Object.entries(detail).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : value}`).join("\n");
  return "Could not complete this review.";
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

export default function TimesheetApprovalsPage() {
  const { user } = useContext(AuthContext);
  const isHrAdmin = ["admin", "hr"].includes(user?.role);
  const [revisions, setRevisions] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("timesheets/approvals/");
      setRevisions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load timesheets awaiting review.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function review(revision, decision) {
    const comment = comments[revision.id] || "";
    if (decision === "request_changes" && !comment.trim()) {
      toast.error("Add a reason before requesting changes.");
      return;
    }
    setSaving(true);
    try {
      await API.post(`timesheets/revisions/${revision.id}/review/`, { decision, comment });
      toast.success(decision === "request_changes" ? "Changes requested." : "Timesheet approved and sent to Finance.");
      await load();
    } catch (error) {
      toast.error(errorText(error), { autoClose: 7000 });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-full bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">{isHrAdmin ? "Timesheet oversight" : "Project approver review"}</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{isHrAdmin ? "Approver reviews" : "Assigned timesheet approvals"}</h1><p className="mt-2 text-sm text-slate-500">{isHrAdmin ? "Review submitted timesheets and see the approver’s decision, comments, and current Finance status." : "You see submissions only for employees assigned to you. Approving sends the timesheet directly to Finance."}</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/> Refresh</button></header>

        <section className="space-y-4">{loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading review queue…</div> : revisions.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><FileText size={30} className="mx-auto text-slate-300"/><h2 className="mt-3 font-semibold text-slate-800">{isHrAdmin ? "No approver reviews yet" : "Nothing waiting for review"}</h2><p className="mt-1 text-sm text-slate-500">{isHrAdmin ? "Submitted timesheets and approver decisions will appear here." : "Timesheets submitted by your assigned employees will appear here."}</p></div> : revisions.map((revision) => {
          const totalHours = (revision.entries || []).reduce((sum, entry) => sum + Number(entry.regular_hours || 0) + Number(entry.extra_hours || 0), 0);
          return <article key={revision.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{isHrAdmin ? `Status: ${revision.status}` : "Awaiting your review"} · Submitted {revision.submitted_at ? new Date(revision.submitted_at).toLocaleString("en-IN") : ""}</p><h2 className="mt-1 text-lg font-bold text-slate-900">{revision.employee_name} <span className="text-sm font-medium text-slate-500">· {revision.employee_id}</span></h2><p className="mt-1 text-sm text-slate-600">{revision.project_name} · {revision.client_name}{revision.site_name ? ` · ${revision.site_name}` : ""}</p><p className="mt-1 text-xs text-slate-500">Week {revision.week_start} – {revision.week_end} · Revision {revision.revision_number}</p>{isHrAdmin && revision.reviewed_by && <p className="mt-1 text-xs text-slate-500">Reviewed by {revision.approver_name || "assigned approver"}{revision.reviewed_at ? ` · ${new Date(revision.reviewed_at).toLocaleString("en-IN")}` : ""}</p>}</div><div className="rounded-xl bg-blue-50 px-4 py-3 text-right"><div className="text-xs text-blue-700">Total hours</div><div className="text-xl font-bold text-blue-900">{totalHours.toFixed(2)}</div></div></header>
            <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div><h3 className="text-sm font-semibold text-slate-800">Daily work entries</h3><div className="mt-2 overflow-x-auto rounded-xl border border-slate-100"><table className="min-w-[550px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Regular</th><th className="px-3 py-2">Extra</th><th className="px-3 py-2">Work description</th></tr></thead><tbody className="divide-y divide-slate-100">{(revision.entries || []).map((entry) => <tr key={entry.id}><td className="px-3 py-3 font-medium text-slate-700">{entry.work_date}</td><td className="px-3 py-3 text-slate-600">{entry.regular_hours}h</td><td className="px-3 py-3 text-slate-600">{entry.extra_hours}h</td><td className="whitespace-pre-wrap px-3 py-3 text-slate-600">{entry.work_description}</td></tr>)}</tbody></table></div></div>
              <div><h3 className="text-sm font-semibold text-slate-800">Attachments ({revision.attachments?.length || 0})</h3>{!revision.attachments?.length ? <p className="mt-2 text-sm text-slate-500">No file attached.</p> : <div className="mt-2 space-y-2">{revision.attachments.map((file) => <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><div className="flex min-w-0 items-center gap-2"><FileText size={17} className="shrink-0 text-rose-600"/><span className="truncate text-sm text-slate-700">{file.file_name?.split("/").pop() || "Weekly PDF"}</span></div><button type="button" onClick={() => downloadAttachment(file.id, file.file_name?.split("/").pop()).catch((error) => toast.error(errorText(error)))} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700"><Download size={15}/> Open PDF</button></div>)}</div>}{revision.employee_note && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Employee note: {revision.employee_note}</p>}{isHrAdmin && revision.reviewer_comment && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Approver comment: {revision.reviewer_comment}</p>}</div>
            </div>
            {!isHrAdmin && <footer className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-5 md:grid-cols-[1fr_auto_auto] md:items-end"><label className="text-sm font-medium text-slate-700">Review comment<textarea rows="2" value={comments[revision.id] || ""} onChange={(event) => setComments((current) => ({ ...current, [revision.id]: event.target.value }))} placeholder="Required when requesting changes" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"/></label><button type="button" onClick={() => review(revision, "request_changes")} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"><MessageSquareText size={16}/> Request changes</button><button type="button" onClick={() => review(revision, "approve")} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><Check size={16}/> Approve & send to Finance</button></footer>}
          </article>;
        })}</section>
      </div>
    </main>
  );
}
