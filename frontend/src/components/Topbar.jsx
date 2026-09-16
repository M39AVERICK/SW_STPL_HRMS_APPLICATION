import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import StplLogo from "./StplLogo";

function Topbar() {
  const { user, logout } = useContext(AuthContext);

  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const shouldShow = sessionStorage.getItem("showWelcome");

    if (shouldShow === "true") {
      setShowWelcome(true);

      sessionStorage.removeItem("showWelcome");

      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, []);

  const userName = user?.name || "User";

  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* TOPBAR */}
      <header className="relative bg-white border-b px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <StplLogo />

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-44 border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          {/* Notification */}
          <button
            type="button"
            className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
          >
            <span className="text-lg">🔔</span>

            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Avatar */}
          <div className="relative">

            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm hover:bg-blue-700 transition"
            >
              {initials}
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">

                <div className="flex items-center gap-3 pb-3 border-b">

                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {userName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {user?.role || "User"}
                    </p>
                  </div>

                </div>

                <button
                  onClick={handleLogout}
                  className="w-full mt-3 text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
                >
                  🚪 Logout
                </button>

              </div>
            )}

          </div>

        </div>
      </header>

      {/* WELCOME NOTIFICATION */}
      {showWelcome && (
        <div className="fixed top-20 right-6 z-[100] animate-fadeSlideUp">

          <div className="w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">

            {/* Avatar */}
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              {initials}
            </div>

            {/* Message */}
            <div className="flex-1">

              <p className="font-semibold text-gray-800">
                Welcome, {userName}! 👋
              </p>

              <p className="text-sm text-gray-500 mt-1">
                You have successfully signed in to STPL HRMS.
              </p>

            </div>

            {/* Close */}
            <button
              onClick={() => setShowWelcome(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

          </div>

        </div>
      )}
    </>
  );
}

export default Topbar;