import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Forgot from "./pages/auth/Forgot";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";

import EmployeeList from "./pages/employees/EmployeeList";
import AddEmployee from "./pages/employees/AddEmployee";
import EditEmployee from "./pages/employees/EditEmployee";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      {/* ✅ ROUTES */}
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />

          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="employees/edit/:id" element={<EditEmployee />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

      {/* ✅ TOAST CONTAINER (VERY IMPORTANT) */}
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