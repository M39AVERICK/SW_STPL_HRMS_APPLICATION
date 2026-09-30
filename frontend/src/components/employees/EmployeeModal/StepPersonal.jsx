// src/components/employee/EmployeeModal/StepPersonal.jsx
import React from "react";

export default function StepPersonal({ formData, onChange, readOnly }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* First Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          First Name
        </label>
        <input
          type="text"
          name="first_name"
          disabled={readOnly}
          value={formData.first_name || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
          required
        />
      </div>

      {/* Middle Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Middle Name
        </label>
        <input
          type="text"
          name="middle_name"
          disabled={readOnly}
          value={formData.middle_name || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Last Name
        </label>
        <input
          type="text"
          name="last_name"
          disabled={readOnly}
          value={formData.last_name || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Gender
        </label>
        <select
          name="gender"
          disabled={readOnly}
          value={formData.gender || "Male"}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Date of Birth
        </label>
        <input
          type="date"
          name="date_of_birth"
          disabled={readOnly}
          value={formData.date_of_birth || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Marital Status */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Marital Status
        </label>
        <select
          name="marital_status"
          disabled={readOnly}
          value={formData.marital_status || "Single"}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        >
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>
      </div>

      {/* Blood Group */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Blood Group
        </label>
        <select
          name="blood_group"
          disabled={readOnly}
          value={formData.blood_group || "A+"}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        >
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
      </div>

      {/* Nationality */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Nationality
        </label>
        <input
          type="text"
          name="nationality"
          disabled={readOnly}
          value={formData.nationality || "Indian"}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Father Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Father Name
        </label>
        <input
          type="text"
          name="father_name"
          disabled={readOnly}
          value={formData.father_name || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Mother Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Mother Name
        </label>
        <input
          type="text"
          name="mother_name"
          disabled={readOnly}
          value={formData.mother_name || ""}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Profile Picture Upload */}
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Profile Picture
        </label>
        <input
          type="file"
          name="profile_picture"
          accept="image/*"
          disabled={readOnly}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-gray-50"
        />
        {typeof formData.profile_picture === "string" &&
  formData.profile_picture && (
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-2">
        Current Profile Picture
      </p>

      <img
        src={formData.profile_picture}
        alt="Current Profile"
        className="w-24 h-24 rounded-full object-cover border border-gray-200"
      />
    </div>
  )}

{formData.profile_picture instanceof File && (
  <p className="text-xs text-green-600 mt-2">
    New image selected: {formData.profile_picture.name}
  </p>
)}

      </div>
    </div>
  );
}