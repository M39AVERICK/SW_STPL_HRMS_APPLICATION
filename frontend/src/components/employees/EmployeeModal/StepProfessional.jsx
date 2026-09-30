// src/components/employee/EmployeeModal/StepProfessional.jsx
import React from "react";

export default function StepProfessional({
  formData,
  onChange,
  departments = [],
  employees = [],
  readOnly,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Position / Job Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Position
        </label>
        <input
          type="text"
          name="position"
          disabled={readOnly}
          value={formData.position || ""}
          onChange={onChange}
          placeholder="e.g. Software Developer"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Employee Type (Permanent / Temporary / Contract) */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Employee Type
        </label>
        <select
          name="employee_type"
          disabled={readOnly}
          value={formData.employee_type || "Permanent"}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        >
          <option value="Permanent">Permanent</option>
          <option value="Probation">Probation</option>
          <option value="Contract">Contract</option>
          <option value="Trainee">Trainee</option>
        </select>
      </div>

      {/* Reporting Manager */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Reporting Manager
        </label>
        <select
          name="reporting_manager"
          disabled={readOnly}
          value={formData.reporting_manager || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        >
          <option value="">Select Manager</option>
          {employees
            .filter((emp) => emp.id !== formData.id) // Exclude current employee from manager list
            .map((emp) => (
              <option key={emp.id} value={emp.id}>
                {`${emp.first_name || ""} ${emp.last_name || ""}`.trim() || `Employee #${emp.id}`}
              </option>
            ))}
        </select>
      </div>

      {/* Work Location */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Work Location
        </label>
        <input
          type="text"
          name="work_location"
          disabled={readOnly}
          value={formData.work_location || ""}
          onChange={onChange}
          placeholder="e.g. MAYUR VIHAR"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Department */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Department
        </label>
        <select
          name="department"
          disabled={readOnly}
          value={formData.department || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Employment Type (Full Time / Part Time) */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Employment Type
        </label>
        <select
          name="employment_type"
          disabled={readOnly}
          value={formData.employment_type || "Full Time"}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        >
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
          <option value="Intern">Intern</option>
        </select>
      </div>

      {/* Joining Date */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Joining Date
        </label>
        <input
          type="date"
          name="joining_date"
          disabled={readOnly}
          value={formData.joining_date || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Salary */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Salary
        </label>
        <input
          type="number"
          step="0.01"
          name="salary"
          disabled={readOnly}
          value={formData.salary || ""}
          onChange={onChange}
          placeholder="0.00"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Is Active Status */}
      <div className="md:col-span-2 flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          disabled={readOnly}
          checked={formData.is_active ?? true}
          onChange={onChange}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
          Is Active Employee
        </label>
      </div>
    </div>
  );
}