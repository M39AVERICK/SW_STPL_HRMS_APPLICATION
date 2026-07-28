import DashboardCards from "../components/dashboard/DashboardCards";
import EmployeeGrowthChart from "../components/dashboard/EmployeeGrowthChart";
import DepartmentChart from "../components/dashboard/DepartmentChart";
import RecentEmployees from "../components/dashboard/RecentEmployees";
import QuickActions from "../components/dashboard/QuickActions";
import Birthdays from "../components/dashboard/Birthdays";
import Notifications from "../components/dashboard/Notifications";

function DashboardHome() {
  return (
    <div className="space-y-6">
      <DashboardCards />

      <div className="grid grid-cols-3 gap-6">
        <EmployeeGrowthChart />
        <Notifications />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <DepartmentChart />
        <Birthdays />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <RecentEmployees />
        <QuickActions />
      </div>
    </div>
  );
}

export default DashboardHome;