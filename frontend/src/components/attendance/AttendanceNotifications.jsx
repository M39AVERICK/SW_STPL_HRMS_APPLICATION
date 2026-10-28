import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import API from "../../api";

export default function AttendanceNotifications() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await API.get("attendance/notifications/");
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Could not load attendance notifications", error);
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
      await API.post("attendance/notifications/");
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    } catch (error) {
      console.error("Could not mark notifications read", error);
    }
  }

  const unread = items.filter((item) => !item.is_read).length;

  return (
    <div className="relative px-3">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white">
        <span className="relative"><Bell size={18}/>{unread > 0 && <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{unread > 9 ? "9+" : unread}</span>}</span>
        <span>Attendance notifications</span>
      </button>
      {open && <section className="absolute left-3 top-full z-50 mt-2 w-[min(340px,calc(100vw-3rem))] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><div className="text-sm font-semibold">Notifications</div><div className="text-xs text-slate-500">Attendance updates for you</div></div>{unread > 0 && <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"><CheckCheck size={14}/> Mark read</button>}</header>
        <div className="max-h-80 overflow-y-auto">{items.length === 0 ? <p className="p-4 text-sm text-slate-500">No attendance notifications yet.</p> : items.slice(0, 12).map((item) => <article key={item.id} className={`border-b border-slate-100 px-4 py-3 last:border-0 ${item.is_read ? "bg-white" : "bg-blue-50/70"}`}><div className="text-sm font-medium">{item.event}</div><div className="mt-1 text-xs text-slate-600">{item.employee_name} · {item.work_location}{item.project_name ? ` · ${item.project_name}` : ""}</div><div className="mt-1 text-xs text-slate-400">{item.attendance_date}</div></article>)}</div>
      </section>}
    </div>
  );
}
