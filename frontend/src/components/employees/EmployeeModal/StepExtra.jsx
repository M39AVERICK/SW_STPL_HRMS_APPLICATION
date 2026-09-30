// src/components/employee/EmployeeModal/StepExtra.jsx
import React from "react";

export default function StepExtra({ formData, onChange, readOnly }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Experience (Years) */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Experience Years
        </label>
        <input
          type="number"
          step="0.1"
          name="experience_years"
          disabled={readOnly}
          value={formData.experience_years || ""}
          onChange={onChange}
          placeholder="e.g. 2.5"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Asset ID */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Asset ID
        </label>
        <input
          type="text"
          name="asset_id"
          disabled={readOnly}
          value={formData.asset_id || ""}
          onChange={onChange}
          placeholder="e.g. AST-1092"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Laptop Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Laptop Number
        </label>
        <input
          type="text"
          name="laptop_number"
          disabled={readOnly}
          value={formData.laptop_number || ""}
          onChange={onChange}
          placeholder="e.g. LPT-8834"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Skills */}
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Skills
        </label>
        <textarea
          name="skills"
          rows="3"
          disabled={readOnly}
          value={formData.skills || ""}
          onChange={onChange}
          placeholder="e.g. Python, Django, Oracle PL/SQL"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Remarks */}
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Remarks
        </label>
        <textarea
          name="remarks"
          rows="3"
          disabled={readOnly}
          value={formData.remarks || ""}
          onChange={onChange}
          placeholder="Any additional remarks or notes..."
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>
    </div>
  );
}