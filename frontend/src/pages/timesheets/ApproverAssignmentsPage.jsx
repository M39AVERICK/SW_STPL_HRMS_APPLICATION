import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, ClipboardCheck, RefreshCw, Search, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../api";

export default function ApproverAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("timesheets/assignments/");
      setAssignments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not load your assigned employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(() => assignments.filter((item) => `${item.employee_name} ${item.employee_id} ${item.project_name} ${item.client_name}`.toLowerCase().includes(search.toLowerCase())), [assignments, search]);
  const employeeCount = new Set(filtered.map((item) => item.employee)).size;

  return <main className="mx-auto max-w-6xl space-y-6 p-5 md:p-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Approver workspace</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Employees assigned to me</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">This list contains only employees whose project assignment names your account as approver. Review their submitted timesheets in Assigned approvals.</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/>Refresh</button></header>
    <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><UserRound size={19}/></span><div><p className="text-xs text-slate-500">Assigned employees</p><p className="text-2xl font-bold text-slate-900">{employeeCount}</p></div></div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><Building2 size={19}/></span><div><p className="text-xs text-slate-500">Project assignments</p><p className="text-2xl font-bold text-slate-900">{filtered.length}</p></div></div></div></div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-900">My assigned employees</h2><p className="mt-1 text-xs text-slate-500">Use the approvals page to approve their submitted timesheets or request changes.</p></div><label className="relative"><span className="sr-only">Search assigned employees</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee or project" className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"/></label></div>
      {loading ? <p className="p-10 text-center text-sm text-slate-500">Loading assigned employees…</p> : filtered.length === 0 ? <div className="p-12 text-center"><UserRound size={30} className="mx-auto text-slate-300"/><h3 className="mt-3 font-semibold text-slate-800">No employees assigned to you</h3><p className="mt-1 text-sm text-slate-500">Ask HR to select your account as approver on an employee’s project assignment.</p></div> : <div className="overflow-x-auto"><table className="min-w-[800px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Client / project</th><th className="px-5 py-3">Assignment period</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Review</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.id}><td className="px-5 py-4"><div className="font-semibold text-slate-800">{item.employee_name}</div><div className="text-xs text-slate-500">{item.employee_id} · {item.attendance_category}</div></td><td className="px-5 py-4"><div className="font-medium text-slate-800">{item.project_name}</div><div className="text-xs text-slate-500">{item.client_name}{item.site_name ? ` · ${item.site_name}` : ""}</div></td><td className="px-5 py-4 text-xs text-slate-600">{item.start_date} – {item.end_date || "Ongoing"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.is_active ? "Active" : "Inactive"}</span></td><td className="px-5 py-4"><Link to="/dashboard/timesheet-approvals" className="inline-flex items-center gap-1 rounded-lg border border-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"><ClipboardCheck size={14}/>Open approvals</Link></td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
