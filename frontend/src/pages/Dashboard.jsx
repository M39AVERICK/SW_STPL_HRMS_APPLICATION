import { Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔵 SIDEBAR */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">

        <div className="p-4 border-b border-slate-600">
          <h2 className="text-lg font-bold">HRMS PANEL</h2>
          <p className="text-xs text-gray-300">
            Role: {user?.role}
          </p>
        </div>

        <div className="flex-1 p-4 space-y-3">

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-left p-2 rounded hover:bg-slate-700"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/dashboard/employees")}
            className="w-full text-left p-2 rounded hover:bg-slate-700"
          >
            Employees
          </button>

          <button
            onClick={() => navigate("/dashboard/employees/add")}
            className="w-full text-left p-2 rounded hover:bg-slate-700"
          >
            Add Employee
          </button>

        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-600">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full bg-red-500 hover:bg-red-600 p-2 rounded"
          >
            Logout
          </button>
        </div>

      </div>

      {/* 🟢 MAIN CONTENT */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        {/* <div className="bg-white p-4 rounded shadow mb-4">
          <h1 className="text-xl font-semibold">
            Welcome, {user?.name || "User"}
          </h1>
          <p className="text-sm text-gray-500">
            HRMS Dashboard
          </p>
        </div> */}

        {/* PAGE CONTENT */}
        <div className="bg-white p-4 rounded shadow min-h-[70vh]">
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default Dashboard;