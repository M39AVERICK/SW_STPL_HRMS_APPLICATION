import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, BriefcaseBusiness, CalendarDays, Mail, MapPin, RefreshCw, UserRound, Upload, Download } from "lucide-react";
import { toast } from "react-toastify";
import API from "../api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const roleNames = { admin: "Administrator", hr: "Human Resources", approver: "Project Approver", finance: "Finance", viewer: "Employee" };

export default function ProfilePage() {
  const { user: sessionUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("users/profile/");
      setProfile(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const account = profile?.data || sessionUser;
  const employee = profile?.employee;
  const initials = (account?.name || "U").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  async function uploadPicture(file) {
    if (!file) return;
    const body = new FormData(); body.append("profile_picture", file);
    try { await API.patch("users/profile/", body); toast.success("Profile photo updated."); await load(); }
    catch (error) { toast.error(error.response?.data?.detail || "Could not update your photo."); }
  }

  async function downloadDocument(doc) {
    try {
      const path = doc.url.split("/api/")[1];
      const response = await API.get(path, { responseType: "blob" });
      const url = URL.createObjectURL(response.data); const link = document.createElement("a");
      link.href = url; link.download = doc.name; link.click(); URL.revokeObjectURL(url);
    } catch { toast.error("Could not download this document."); }
  }

  return <main className="mx-auto max-w-5xl space-y-6 p-5 md:p-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">My account</p><h1 className="mt-1 text-3xl font-bold text-slate-900">My profile</h1><p className="mt-2 text-sm text-slate-500">Your sign-in details and linked employee information.</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/>Refresh</button></header>
    {loading && !account ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading profile…</div> : <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="bg-gradient-to-r from-slate-950 to-blue-900 p-7 text-white"><div className="flex flex-wrap items-center gap-5"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-white/20">{employee?.profile_picture ? <img src={employee.profile_picture} alt="Profile" className="h-full w-full object-cover"/> : initials}</div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Account profile</p><h2 className="mt-1 text-2xl font-bold">{account?.name || "User"}</h2><p className="mt-1 text-sm text-slate-300">{roleNames[account?.role] || account?.role}</p></div>{employee && <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold"><Upload size={16}/> Edit photo<input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadPicture(event.target.files?.[0])}/></label>}</div></div><div className="grid gap-4 p-6 sm:grid-cols-2"><Info icon={<Mail size={18}/>} label="Login email" value={account?.email}/><Info icon={<BadgeCheck size={18}/>} label="Account role" value={roleNames[account?.role] || account?.role}/><Info icon={<CalendarDays size={18}/>} label="Date of birth" value={account?.date_of_birth}/><Info icon={<BadgeCheck size={18}/>} label="Account status" value={account?.is_active ? "Active" : "Inactive"}/></div></section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 p-5"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><UserRound size={20}/></span><div><h2 className="font-bold text-slate-900">Employee record</h2><p className="mt-1 text-xs text-slate-500">Details linked by HR to this login.</p></div></div>{employee ? <><div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3"><Info icon={<UserRound size={18}/>} label="Employee" value={`${employee.full_name} · ${employee.employee_id}`}/><Info icon={<Mail size={18}/>} label="Official email" value={employee.official_email}/><Info icon={<BriefcaseBusiness size={18}/>} label="Position / department" value={[employee.position, employee.department].filter(Boolean).join(" · ")}/><Info icon={<BadgeCheck size={18}/>} label="Attendance category" value={employee.attendance_category}/><Info icon={<MapPin size={18}/>} label="Work location" value={employee.work_location}/><Info icon={<CalendarDays size={18}/>} label="Joining date" value={employee.joining_date}/></div><div className="border-t border-slate-100 p-6"><h3 className="font-semibold text-slate-900">Documents on file</h3>{employee.documents?.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{employee.documents.map((doc) => <button key={doc.field} onClick={() => downloadDocument(doc)} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-left text-sm hover:bg-slate-50"><span className="truncate">{doc.name}</span><Download size={16} className="ml-2 shrink-0 text-blue-700"/></button>)}</div> : <p className="mt-2 text-sm text-slate-500">No documents have been provided to HR.</p>}</div></> : <p className="p-6 text-sm text-slate-600">No employee record is linked to this login. If you are an employee, contact HR to link your account.</p>}</section>
    </>}
  </main>;
}

function Info({ icon, label, value }) {
  return <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/60 p-4"><div className="flex items-center gap-2 text-slate-400">{icon}<p className="text-xs font-medium uppercase tracking-wide">{label}</p></div><p className="mt-2 break-words text-sm font-semibold text-slate-800">{value || "Not provided"}</p></div>;
}
