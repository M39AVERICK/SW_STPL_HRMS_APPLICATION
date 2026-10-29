import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Forgot from "./pages/auth/Forgot";
import ResetPassword from "./pages/auth/ResetPassword";

// Main Dashboard Layout & Home
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";

// Employee Pages
import EmployeeList from "./components/employees/EmployeeList";
import AttendancePage from "./pages/attendance/AttendancePage";
import AttendanceCategoryPage from "./pages/attendance/AttendanceCategoryPage";
import EmployeeTimesheetPage from "./pages/timesheets/EmployeeTimesheetPage";
const TimesheetApprovalsPage = lazy(() => import("./pages/timesheets/TimesheetApprovalsPage"));
const ProjectManagementPage = lazy(() => import("./pages/timesheets/ProjectManagementPage"));
const FinanceProcessingPage = lazy(() => import("./pages/timesheets/FinanceProcessingPage"));
const TimesheetPayrollRecordsPage = lazy(() => import("./pages/timesheets/TimesheetPayrollRecordsPage"));
const UserAccessPage = lazy(() => import("./pages/UserAccessPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ApproverAssignmentsPage = lazy(() => import("./pages/timesheets/ApproverAssignmentsPage"));
import ViewerDashboard from "./pages/ViewerDashboard";


// Guard Route
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      {/* ✅ ROUTES */}
      <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading dashboard…</div>}>
      <Routes>

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

        {/* Protected Dashboard Layout with Nested Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "approver", "finance", "viewer"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Renders at /dashboard */}
          <Route index element={<ProtectedRoute allowedRoles={["admin", "hr", "approver", "finance", "viewer"]}><DashboardHome /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute allowedRoles={["admin", "hr", "approver", "finance", "viewer"]}><ProfilePage /></ProtectedRoute>} />

          {/* Renders at /dashboard/employees */}
          <Route path="employees" element={<ProtectedRoute allowedRoles={["admin", "hr"]}><EmployeeList /></ProtectedRoute>} />
          <Route path="projects" element={<ProtectedRoute allowedRoles={["admin", "hr"]}><ProjectManagementPage /></ProtectedRoute>} />
          <Route path="access" element={<ProtectedRoute allowedRoles={["admin", "hr"]}><UserAccessPage /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute allowedRoles={["admin", "hr"]}><AttendancePage /></ProtectedRoute>} />
          <Route path="on-site-attendance" element={<ProtectedRoute allowedRoles={["admin", "hr", "viewer"]}><AttendanceCategoryPage /></ProtectedRoute>} />
          <Route path="timesheets" element={<ProtectedRoute allowedRoles={["viewer"]}><EmployeeTimesheetPage /></ProtectedRoute>} />
          <Route path="assigned-employees" element={<ProtectedRoute allowedRoles={["approver"]}><ApproverAssignmentsPage /></ProtectedRoute>} />
          <Route path="timesheet-approvals" element={<ProtectedRoute allowedRoles={["admin", "hr", "approver"]}><TimesheetApprovalsPage /></ProtectedRoute>} />
          <Route path="finance" element={<ProtectedRoute allowedRoles={["finance"]}><FinanceProcessingPage /></ProtectedRoute>} />
          <Route path="payroll-records" element={<ProtectedRoute allowedRoles={["admin", "hr"]}><TimesheetPayrollRecordsPage /></ProtectedRoute>} />

          
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
      </Suspense>

      {/* ✅ TOAST CONTAINER */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
