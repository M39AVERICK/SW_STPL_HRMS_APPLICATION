import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-black text-white min-h-screen p-5">

      {/* Logo / Title */}
      <h1 className="text-2xl font-bold mb-8 tracking-wide">
        STPL
      </h1>

      {/* Navigation */}
      <nav className="space-y-5 text-sm font-semibold">

        <Link to="/" className="block hover:text-yellow-400">
          📊 Dashboard
        </Link>

        <Link to="/po" className="block hover:text-yellow-400">
          📦 Purchase Orders
        </Link>

        <Link to="/vendors" className="block hover:text-yellow-400">
          👥 Vendors
        </Link>

        <Link to="/reports" className="block hover:text-yellow-400">
          📈 Reports
        </Link>

      </nav>
    </div>
  );
}

export default Sidebar;