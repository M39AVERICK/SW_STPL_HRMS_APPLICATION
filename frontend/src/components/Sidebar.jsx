import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Clock, 
  CalendarOff, 
  DollarSign, 
  Package, 
  Briefcase 
} from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
    { label: "Employees", path: "/dashboard/employees", icon: Users },
    { label: "Add Employee", path: "/dashboard/employees/add", icon: UserPlus },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
        <div className="bg-blue-600 p-2 rounded-lg text-white font-bold text-lg">
          HR
        </div>
        <span className="font-bold text-white text-lg tracking-wide">HRMS Portal</span>
      </div>

      {/* Main Navigation */}
      <div className="p-4 flex-1 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "hover:bg-slate-800 hover:text-white text-slate-400"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Coming Soon Modules */}
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">
          Upcoming Modules
        </p>
        {[
          { label: "Attendance", icon: Clock },
          { label: "Leave Management", icon: CalendarOff },
          { label: "Payroll", icon: DollarSign },
          { label: "Assets", icon: Package },
          { label: "Recruitment", icon: Briefcase },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-500 text-sm opacity-60">
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Soon</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}