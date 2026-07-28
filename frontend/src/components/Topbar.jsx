import StplLogo from "./StplLogo";

function Topbar() {
  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between items-center">

      <StplLogo />

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-1 rounded"
        />

        <span>🔔</span>

        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
          A
        </div>
      </div>
    </div>
  );
}

export default Topbar;