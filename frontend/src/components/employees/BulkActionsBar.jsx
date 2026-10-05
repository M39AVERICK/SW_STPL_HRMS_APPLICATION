// src/components/employee/BulkActionBar.jsx
import React from "react";
import API from "../../api";
import { toast } from "react-toastify";

export default function BulkActionBar({
  selectedEmployees,
  setSelectedEmployees,
  loadEmployees,
  onExportSelected,
}) {
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Delete ${selectedEmployees.length} selected employees?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedEmployees.map((id) =>
          API.delete(`hr/employees/${id}/`)
        )
      );

      toast.success("Selected employees deleted");

      setSelectedEmployees([]);

      await loadEmployees();
    } catch (err) {
      console.error(err);
      toast.error("Bulk deletion failed");
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl mb-4 flex justify-between items-center text-sm">
      <span>
        <strong>{selectedEmployees.length}</strong>{" "}
        employee(s) selected
      </span>

      <div className="flex gap-2">
        {/* Export Selected */}
        <button
          type="button"
          onClick={onExportSelected}
          className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 font-medium transition"
        >
          Export Selected
        </button>

        {/* Delete Selected */}
        <button
          type="button"
          onClick={handleBulkDelete}
          className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 font-medium transition"
        >
          Delete Selected
        </button>

        {/* Deselect */}
        <button
          type="button"
          onClick={() => setSelectedEmployees([])}
          className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 transition"
        >
          Deselect All
        </button>
      </div>
    </div>
  );
}
