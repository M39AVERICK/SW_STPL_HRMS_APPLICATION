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


// Guard Route
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      {/* ✅ ROUTES */}
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
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Renders at /dashboard */}
          <Route index element={<DashboardHome />} />

          {/* Renders at /dashboard/employees */}
          <Route path="employees" element={<EmployeeList />} />

          
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

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