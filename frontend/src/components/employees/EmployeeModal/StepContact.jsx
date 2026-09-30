// src/components/employee/EmployeeModal/StepContact.jsx
import React from "react";

export default function StepContact({ formData, onChange, readOnly }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Official Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Official Email
        </label>
        <input
          type="email"
          name="official_email"
          disabled={readOnly}
          value={formData.official_email || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Personal Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Personal Email
        </label>
        <input
          type="email"
          name="personal_email"
          disabled={readOnly}
          value={formData.personal_email || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Phone Number
        </label>
        <input
          type="text"
          name="phone_number"
          disabled={readOnly}
          value={formData.phone_number || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Postal Code
        </label>
        <input
          type="text"
          name="postal_code"
          disabled={readOnly}
          value={formData.postal_code || ""}
          onChange={onChange}
          placeholder="e.g. 121001"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Current Address */}
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Current Address
        </label>
        <textarea
          name="current_address"
          rows="2"
          disabled={readOnly}
          value={formData.current_address || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Permanent Address */}
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Permanent Address
        </label>
        <textarea
          name="permanent_address"
          rows="2"
          disabled={readOnly}
          value={formData.permanent_address || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          City
        </label>
        <input
          type="text"
          name="city"
          disabled={readOnly}
          value={formData.city || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* State */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          State
        </label>
        <input
          type="text"
          name="state"
          disabled={readOnly}
          value={formData.state || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Country
        </label>
        <input
          type="text"
          name="country"
          disabled={readOnly}
          value={formData.country || "India"}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Emergency Contact Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Emergency Contact Name
        </label>
        <input
          type="text"
          name="emergency_contact_name"
          disabled={readOnly}
          value={formData.emergency_contact_name || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Emergency Contact Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Emergency Contact Number
        </label>
        <input
          type="text"
          name="emergency_contact_number"
          disabled={readOnly}
          value={formData.emergency_contact_number || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Emergency Contact Relation */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Emergency Contact Relation
        </label>
        <input
          type="text"
          name="emergency_contact_relation"
          disabled={readOnly}
          value={formData.emergency_contact_relation || ""}
          onChange={onChange}
          placeholder="e.g. Father / Spouse"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>
    </div>
  );
}