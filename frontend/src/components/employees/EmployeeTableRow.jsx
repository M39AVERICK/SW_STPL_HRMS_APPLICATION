// src/components/employee/EmployeeTableRow.jsx
import React, { useState } from "react";
import { Link2 } from "lucide-react";

function EmployeeAvatar({ employee }) {
  const [failed, setFailed] = useState(false);
  const initials = `${employee.first_name?.[0] || "E"}${employee.last_name?.[0] || ""}`.toUpperCase();
  if (!employee.profile_picture || failed) {
    return <div aria-label={`${employee.first_name || "Employee"} profile initials`} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-blue-50 text-xs font-bold text-blue-700">{initials}</div>;
  }
  return <img src={employee.profile_picture} alt={`${employee.first_name || "Employee"} profile`} onError={() => setFailed(true)} className="h-10 w-10 rounded-full border border-gray-200 object-cover"/>;
}

const EmployeeTableRow = React.memo(
  ({ emp, isSelected, onToggleSelect, onView, onEdit, onDelete, onLinkAccount }) => {
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
        <td className="text-center px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(emp.id)}
          />
        </td>
        <td className="px-4 py-3">
          <EmployeeAvatar employee={emp}/>
        </td>
        <td className="px-4 py-3 font-medium text-gray-700">{emp.employee_id}</td>
        <td className="px-4 py-3 font-semibold text-gray-900">
          {emp.first_name} {emp.last_name}
        </td>
        <td className="px-4 py-3 text-gray-600">{emp.department_name || "N/A"}</td>
        <td className="px-4 py-3 text-gray-600">{emp.position || "N/A"}</td>
        <td className="px-4 py-3 text-gray-600">
          <div>{emp.official_email || "N/A"}</div>
          <div className={`mt-1 text-[11px] ${emp.linked_user_email ? "text-emerald-700" : "text-amber-700"}`}>
            {emp.linked_user_email ? `Login: ${emp.linked_user_email}` : "Employee login not linked"}
          </div>
        </td>
        <td className="px-4 py-3 text-gray-600">{emp.phone_number || "N/A"}</td>
        <td className="px-4 py-3 text-center">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              emp.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {emp.is_active ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => onView(emp)}
              title="View"
              className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              👁
            </button>
            <button
              onClick={() => onEdit(emp)}
              title="Edit"
              className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"
            >
              ✏
            </button>
            <button
              onClick={() => onLinkAccount(emp)}
              title="Link employee login account"
              className="p-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            >
              <Link2 size={16} />
            </button>
            <button
              onClick={() => onDelete(emp.id)}
              title="Delete"
              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              🗑
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

export default EmployeeTableRow;
