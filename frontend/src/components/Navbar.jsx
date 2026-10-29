import { Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import NotificationCenter from "./NotificationCenter";
import API from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [profilePicture, setProfilePicture] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const userName = user?.name || user?.email || "User";
  const roleLabel = user?.role ? `${user.role[0].toUpperCase()}${user.role.slice(1)}` : "User";
  const roleDescription = {
    admin: "Organization control",
    hr: "People operations",
    approver: "Project approvals",
    finance: "Finance processing",
    viewer: "Employee self-service",
  }[user?.role] || "HRMS Portal";
  const initials = userName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const roleColors = {
    admin: "bg-violet-100 text-violet-700",
    hr: "bg-blue-100 text-blue-700",
    approver: "bg-amber-100 text-amber-700",
    finance: "bg-emerald-100 text-emerald-700",
    viewer: "bg-slate-100 text-slate-700",
  };

  useEffect(() => {
    let mounted = true;
    const loadProfilePicture = async () => {
      if (user?.role !== "viewer") {
        setProfilePicture("");
        return;
      }
      try {
        const response = await API.get("users/profile/");
        if (mounted) setProfilePicture(response.data?.employee?.profile_picture || "");
      } catch {
        if (mounted) setProfilePicture("");
      }
    };
    loadProfilePicture();
    const handlePictureUpdate = (event) => setProfilePicture(event.detail || "");
    window.addEventListener("profile-picture-updated", handlePictureUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("profile-picture-updated", handlePictureUpdate);
    };
  }, [user?.id, user?.role]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Global Search Bar */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={user?.role === "finance" ? "Search finance records..." : user?.role === "approver" ? "Search assigned reviews..." : "Search employee, records..."}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <NotificationCenter />

        <div className="h-6 w-px bg-gray-200"></div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/dashboard/profile")} title="Open my profile" aria-label="Open my profile" className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition hover:ring-2 hover:ring-blue-300 ${roleColors[user?.role] || roleColors.viewer}`}>
            {profilePicture ? <img src={profilePicture} alt="" onError={() => setProfilePicture("")} className="h-full w-full rounded-xl object-cover"/> : initials}
          </button>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{userName}</p>
            <p className="text-xs text-gray-500">{roleLabel} · {roleDescription}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition ml-1"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
