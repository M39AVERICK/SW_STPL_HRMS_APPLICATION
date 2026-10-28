import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AdminOnSiteAttendancePage from "./AdminOnSiteAttendancePage";
import OnSiteAttendancePage from "./OnSiteAttendancePage";

export default function AttendanceCategoryPage() {
  const { user } = useContext(AuthContext);
  return ["admin", "hr"].includes(user?.role)
    ? <AdminOnSiteAttendancePage />
    : <OnSiteAttendancePage />;
}
