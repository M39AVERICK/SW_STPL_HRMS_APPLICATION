// src/components/employee/EmployeeModal/StepBank.jsx
import React from "react";

export default function StepBank({ formData, onChange, readOnly }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bank Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Bank Name
        </label>
        <input
          type="text"
          name="bank_name"
          disabled={readOnly}
          value={formData.bank_name || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
          placeholder="e.g. UNION BANK"
        />
      </div>

      {/* Account Holder Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Account Holder Name
        </label>
        <input
          type="text"
          name="account_holder_name"
          disabled={readOnly}
          value={formData.account_holder_name || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
          placeholder="e.g. NAME"
        />
      </div>

      {/* Account Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Account Number
        </label>
        <input
          type="text"
          name="account_number"
          disabled={readOnly}
          value={formData.account_number || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
          placeholder="e.g. 12345678"
        />
      </div>

      {/* IFSC Code */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          IFSC Code
        </label>
        <input
          type="text"
          name="ifsc_code"
          disabled={readOnly}
          value={formData.ifsc_code || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm uppercase disabled:bg-gray-50"
          placeholder="e.g. SBIN0001234"
        />
      </div>

      {/* Branch Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Branch Name
        </label>
        <input
          type="text"
          name="branch_name"
          disabled={readOnly}
          value={formData.branch_name || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
          placeholder="e.g. sonipat"
        />
      </div>

      {/* Account Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Account Type
        </label>
        <select
          name="account_type"
          disabled={readOnly}
          value={formData.account_type || "SAVINGS"}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        >
          <option value="SAVINGS">SAVINGS</option>
          <option value="CURRENT">CURRENT</option>
          <option value="SALARY">SALARY</option>
        </select>
      </div>
    </div>
  );
}