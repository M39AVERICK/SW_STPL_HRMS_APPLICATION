// src/components/employee/EmployeeFilters.jsx
import React from "react";

export default function EmployeeFilters({
  search,
  setSearch,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter,
  departments,
  onManageDepartments,
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 flex flex-wrap gap-4 justify-between items-center">
      
      {/* Search */}
      <div className="flex-1 min-w-240px">
        <input
          type="text"
          placeholder="Search by Name, ID, Email, Position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">

        {/* Department */}
        <div className="flex gap-2">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All Departments</option>

            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Manage Departments */}
          <button
            type="button"
            onClick={onManageDepartments}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm hover:bg-gray-50 transition"
            title="Manage Departments"
          >
            ⚙ Departments
          </button>
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* Clear Filters */}
        {(search || departmentFilter || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDepartmentFilter("");
              setStatusFilter("");
            }}
            className="text-xs text-red-500 hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
