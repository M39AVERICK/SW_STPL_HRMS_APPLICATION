import { NavLink } from "react-router-dom";

function Sidebar() {
  const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "📊",
  },
  {
    name: "Employees",
    path: "/dashboard/employees",
    icon: "👥",
  },
];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Logo / Branding */}
      <div className="px-5 py-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wide">
          STPL
        </h1>

        <p className="text-xs text-slate-400 mt-1">
          HRMS PANEL
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}

      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          HRMS
        </p>
      </div>

    </aside>
  );
}

export default Sidebar;

