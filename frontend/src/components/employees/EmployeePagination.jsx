// src/components/employee/EmployeePagination.jsx
import React from "react";

export default function EmployeePagination({
  currentPage,
  totalPages,
  setCurrentPage,
  totalRecords,
  indexOfFirstRecord,
  indexOfLastRecord,
}) {
  if (totalRecords === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4 flex flex-wrap justify-between items-center text-sm text-gray-600">
      <div>
        Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to{" "}
        <span className="font-semibold">
          {Math.min(indexOfLastRecord, totalRecords)}
        </span>{" "}
        of <span className="font-semibold">{totalRecords}</span> entries
      </div>

      <div className="flex gap-2 items-center">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        <span className="px-2">
          Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
        </span>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}