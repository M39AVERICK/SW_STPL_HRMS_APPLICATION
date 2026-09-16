
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout() {
  return (
  <div className="hrms-app">
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 min-w-0">

        {/* Topbar */}
        <Topbar />

        {/* Breadcrumb */}
        <div className="bg-white border-b px-6 py-3">
          <p className="text-sm text-gray-500">
            HRMS / Dashboard
          </p>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-[70vh]">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} STPL HRMS. All rights reserved.
        </footer>

      </div>
    </div>
  </div>
  );
}

export default Layout;

