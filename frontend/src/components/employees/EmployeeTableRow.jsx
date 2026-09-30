// src/components/employee/EmployeeTableRow.jsx
import React from "react";

const EmployeeTableRow = React.memo(
  ({ emp, isSelected, onToggleSelect, onView, onEdit, onDelete }) => {
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
          <img
            src={
              emp.profile_picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                emp.first_name || "Employee"
              )}`
            }
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        </td>
        <td className="px-4 py-3 font-medium text-gray-700">{emp.employee_id}</td>
        <td className="px-4 py-3 font-semibold text-gray-900">
          {emp.first_name} {emp.last_name}
        </td>
        <td className="px-4 py-3 text-gray-600">{emp.department_name || "N/A"}</td>
        <td className="px-4 py-3 text-gray-600">{emp.position || "N/A"}</td>
        <td className="px-4 py-3 text-gray-600">{emp.official_email || "N/A"}</td>
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