import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { accessToken, user, loading } = useContext(AuthContext);

  const token = accessToken || localStorage.getItem("accessToken");

  // 🔥 prevent flicker on reload
  if (loading) return null;

  // ❌ not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 role-based check (HRMS upgrade)
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;