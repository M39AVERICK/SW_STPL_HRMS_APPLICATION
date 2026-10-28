import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, UserRoundCog, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import API from "../api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const roles = [
  ["viewer", "Employee"],
  ["approver", "Project approver"],
  ["hr", "HR"],
  ["finance", "Finance"],
  ["admin", "Admin"],
];

export default function UserAccessPage() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("timesheets/access-users/");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not load user access.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function updateRole(account, role) {
    setSavingId(account.id);
    try {
      const response = await API.patch("timesheets/access-users/", { user_id: account.id, role });
      setUsers((current) => current.map((item) => item.id === account.id ? response.data : item));
      toast.success(`${account.name}'s access role is now ${role}.`);
    } catch (error) {
      const data = error.response?.data;
      const message = typeof data?.detail === "string" ? data.detail : data?.errors?.join(" ") || JSON.stringify(data || "Could not update this account.");
      toast.error(message);
      await load();
    } finally {
      setSavingId(null);
    }
  }

  return <main className="mx-auto max-w-6xl space-y-6 p-5 md:p-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Admin / HR security</p><h1 className="mt-1 text-3xl font-bold text-slate-900">User access</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">Choose what each account can do. Project approvers can review assignments linked to them; Finance accounts receive only HR-cleared timesheets.</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/>Refresh</button></header>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-start gap-3 border-b border-slate-100 p-5"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><ShieldCheck size={20}/></span><div><h2 className="font-bold text-slate-900">Account roles</h2><p className="mt-1 text-xs text-slate-500">Role changes apply to backend permissions immediately. Users may need to sign in again for the updated dashboard menu.</p></div></div>
      {loading ? <p className="p-10 text-center text-sm text-slate-500">Loading accounts…</p> : users.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">No active accounts found.</p> : <div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Account</th><th className="px-5 py-3">Linked employee</th><th className="px-5 py-3">Current role</th><th className="px-5 py-3">Change access</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((account) => <tr key={account.id}><td className="px-5 py-4"><div className="font-semibold text-slate-800">{account.name}</div><div className="text-xs text-slate-500">{account.email}</div></td><td className="px-5 py-4">{account.employee_name ? <><div className="text-slate-700">{account.employee_name}</div><div className="text-xs text-slate-500">{account.employee_id}</div></> : <span className="text-xs text-slate-400">No employee profile</span>}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{account.role}</span></td><td className="px-5 py-4"><select aria-label={`Role for ${account.email}`} value={account.role} disabled={savingId === account.id || account.id === currentUser?.id} onChange={(event) => updateRole(account, event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50">{roles.filter(([key]) => currentUser?.role === "admin" || key !== "admin").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>{savingId === account.id && <span className="ml-2 text-xs text-slate-400"><UserRoundCog className="inline" size={14}/> Saving</span>}</td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
