// src/components/employee/EmployeeModal/StepIdentity.jsx
import React from "react";

export default function StepIdentity({ formData, onChange, readOnly }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* PAN Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          PAN Number
        </label>
        <input
          type="text"
          name="pan"
          disabled={readOnly}
          value={formData.pan || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm uppercase disabled:bg-gray-50"
          placeholder="e.g. PQRSX5678E"
        />
      </div>

      {/* Aadhaar Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Aadhaar Number
        </label>
        <input
          type="text"
          name="aadhaar"
          disabled={readOnly}
          value={formData.aadhaar || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
          placeholder="e.g. 642420250302"
        />
      </div>

      {/* UAN Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          UAN Number
        </label>
        <input
          type="text"
          name="uan"
          disabled={readOnly}
          value={formData.uan || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
          placeholder="e.g. 100400500600"
        />
      </div>

      {/* PF Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          PF Number
        </label>
        <input
          type="text"
          name="pf_number"
          disabled={readOnly}
          value={formData.pf_number || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm uppercase disabled:bg-gray-50"
          placeholder="e.g. PF67891"
        />
      </div>
    </div>
  );
}