import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, ClipboardCheck, ClipboardList, Clock3, Users, WalletCards } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const dashboardIcons = {
  users: <Users size={21}/>,
  briefcase: <Briefcase size={21}/>,
  review: <ClipboardCheck size={21}/>,
  attendance: <Clock3 size={21}/>,
  timesheet: <ClipboardList size={21}/>,
  finance: <WalletCards size={21}/>,
};

export default function DashboardHome() {
  const { user } = useContext(AuthContext);
  const role = user?.role || "viewer";
  const dashboard = {
    admin: {
      eyebrow: "Administration",
      title: "Organization dashboard",
      description: "Manage people, attendance, projects, and the full timesheet approval process.",
      cards: [
        ["Employees", "Employee records and On-site / In-house categories", "/dashboard/employees", "users"],
        ["Clients & projects", "Client records and employee project assignments", "/dashboard/projects", "briefcase"],
        ["Assigned approvals", "Review submitted timesheets assigned to your account", "/dashboard/timesheet-approvals", "review"],
        ["Attendance", "In-house and client-site attendance records", "/dashboard/attendance", "attendance"],
      ],
    },
    hr: {
      eyebrow: "Human resources",
      title: "HR operations dashboard",
      description: "Manage employees and assignments, then check approver-reviewed timesheets before Finance.",
      cards: [
        ["Employees", "Employee records and attendance categories", "/dashboard/employees", "users"],
        ["Clients & projects", "Maintain project assignments and approvers", "/dashboard/projects", "briefcase"],
        ["Assigned approvals", "Review submissions if your account is a project's approver", "/dashboard/timesheet-approvals", "review"],
        ["On-site attendance", "Review client-site attendance records", "/dashboard/on-site-attendance", "attendance"],
      ],
    },
    approver: {
      eyebrow: "Project approver",
      title: "My approval dashboard",
      description: "See only employees assigned to you, review their submitted timesheets, and send approved timesheets directly to Finance.",
      cards: [
        ["Assigned employees", "See the employees and projects HR assigned to you", "/dashboard/assigned-employees", "users"],
        ["Timesheet approvals", "Review submissions and approve them to Finance", "/dashboard/timesheet-approvals", "review"],
      ],
    },
    finance: {
      eyebrow: "Finance",
      title: "Finance processing dashboard",
      description: "Review timesheets cleared by HR, record the finance reference, and mark processing complete.",
      cards: [
        ["Finance processing", "Timesheets approved by the project approver and HR", "/dashboard/finance", "finance"],
      ],
    },
    viewer: {
      eyebrow: "Employee self-service",
      title: "My work dashboard",
      description: "Record attendance and keep your weekly project timesheet up to date.",
      cards: [
        ["My attendance", "Check in and view your attendance records", "/dashboard/on-site-attendance", "attendance"],
        ["My timesheet", "Enter hours, attach your weekly PDF, and submit", "/dashboard/timesheets", "timesheet"],
      ],
    },
  }[role];

  return (
    <main className="mx-auto max-w-7xl space-y-7 p-5 md:p-8">
      <header className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-lg md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">{dashboard.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">{dashboard.title}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{dashboard.description}</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboard.cards.map(([title, description, path, icon]) => <Link key={path} to={path} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
          <div className="flex items-start justify-between"><span className="rounded-xl bg-blue-50 p-3 text-blue-700">{dashboardIcons[icon]}</span><ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"/></div>
          <h2 className="mt-5 font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
        </Link>)}
      </section>
      <p className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-900">Use the bell in the top bar for attendance and timesheet updates. It refreshes automatically and shows unread counts.</p>
    </main>
  );
}
