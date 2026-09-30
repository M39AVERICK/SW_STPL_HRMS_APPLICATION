import React from "react";

export default function EmployeeHeader({ openAdd, exportExcel, importExcel }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-500 mt-2">
            Manage employees, departments, documents, and payroll information.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
          >
            ➕ Add Employee
          </button>
          <button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl"
          >
            📊 Export Excel
          </button>
          <label className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl cursor-pointer">
            📥 Import Excel
            <input hidden type="file" onChange={importExcel} />
          </label>
        </div>
      </div>
    </div>
  );
}