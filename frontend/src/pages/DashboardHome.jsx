import { Clock, CheckCircle2 } from "lucide-react";

export default function DashboardHome() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-800">HRMS Dashboard</h1>
        <p className="text-gray-500 mt-2">Enterprise Analytics Dashboard</p>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-50 rounded-full">
            <Clock size={60} className="text-blue-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">
          Dashboard Under Development
        </h2>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          Analytics widgets will automatically become available as each HRMS module is completed.
        </p>
      </div>

      {/* Development Roadmap */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Development Roadmap</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <RoadmapItem title="Authentication" done />
          <RoadmapItem title="Employee Management" done />
          <RoadmapItem title="Attendance Module" />
          <RoadmapItem title="Leave Management" />
          <RoadmapItem title="Payroll Module" />
          <RoadmapItem title="Assets Module" />
          <RoadmapItem title="Recruitment Module" />
          <RoadmapItem title="Performance Module" />
          <RoadmapItem title="Reports & Analytics" />
          <RoadmapItem title="Enterprise Dashboard" />
        </div>
      </div>
    </div>
  );
}

function RoadmapItem({ title, done = false }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
        done ? "bg-green-50/60 border-green-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      <span className={`font-medium ${done ? "text-green-900" : "text-gray-700"}`}>
        {title}
      </span>
      {done ? (
        <CheckCircle2 className="text-green-600" size={22} />
      ) : (
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-200/60 px-2.5 py-1 rounded-md">
          Coming Soon
        </span>
      )}
    </div>
  );
}