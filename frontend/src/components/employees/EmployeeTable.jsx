// src/components/employee/EmployeeTable.jsx
import React from "react";
import EmployeeTableRow from "./EmployeeTableRow";

export default function EmployeeTable({
  records,
  loading,
  selectedEmployees,
  toggleSelectEmployee,
  handleSort,
  sortField,
  sortOrder,
  onView,
  onEdit,
  onDelete,
}) {
  const renderSortArrow = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-center">Select</th>
            <th className="px-4 py-3">Photo</th>
            <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("employee_id")}>
              ID {renderSortArrow("employee_id")}
            </th>
            <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("first_name")}>
              Name {renderSortArrow("first_name")}
            </th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Position</th>
            <th className="px-4 py-3">Official Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="10" className="text-center py-8 text-gray-500">
                Loading employees...
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center py-8 text-gray-500">
                No matching employees found.
              </td>
            </tr>
          ) : (
            records.map((emp) => (
              <EmployeeTableRow
                key={emp.id}
                emp={emp}
                isSelected={selectedEmployees.includes(emp.id)}
                onToggleSelect={toggleSelectEmployee}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}