import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import API from "../api";

function asList(data) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
}

export default function NotificationCenter() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [attendance, timesheets] = await Promise.all([
        API.get("attendance/notifications/"),
        API.get("timesheets/notifications/"),
      ]);
      const attendanceItems = asList(attendance.data).map((item) => ({
        ...item,
        source: "attendance",
        message: `${item.employee_name} · ${item.work_location}${item.project_name ? ` · ${item.project_name}` : ""} · ${item.attendance_date}`,
      }));
      const timesheetItems = asList(timesheets.data).map((item) => ({ ...item, source: "timesheet" }));
      setItems([...attendanceItems, ...timesheetItems].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error("Could not load notifications", error);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(load, 0);
    const timer = window.setInterval(load, 30000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [load]);

  async function markAllRead() {
    try {
      await Promise.all([
        API.post("attendance/notifications/"),
        API.post("timesheets/notifications/"),
      ]);
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    } catch (error) {
      console.error("Could not mark notifications as read", error);
    }
  }

  const unread = items.filter((item) => !item.is_read).length;

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
        <Bell size={20}/>
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-blue-600 px-1 text-center text-[10px] font-bold leading-4 text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && <section className="absolute right-0 top-12 z-50 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-bold">Notifications</h2><p className="text-xs text-slate-500">Attendance and timesheet updates · refreshes every 30 seconds</p></div>{unread > 0 && <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><CheckCheck size={14}/> Mark read</button>}</header>
        <div className="max-h-96 overflow-y-auto">{items.length === 0 ? <div className="p-5"><p className="text-sm text-slate-600">You’re all caught up.</p><p className="mt-1 text-xs text-slate-400">Attendance punches and timesheet review steps will appear here when they concern your account.</p></div> : items.slice(0, 30).map((item) => <article key={`${item.source}-${item.id}`} className={`border-b border-slate-100 px-4 py-3 last:border-0 ${item.is_read ? "bg-white" : "bg-blue-50/70"}`}><div className="flex items-center justify-between gap-3"><div className="text-sm font-semibold">{item.event}</div><span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.source}</span></div><p className="mt-1 text-xs leading-5 text-slate-600">{item.message}</p><p className="mt-1 text-[11px] text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleString("en-IN") : ""}</p></article>)}</div>
      </section>}
    </div>
  );
}
