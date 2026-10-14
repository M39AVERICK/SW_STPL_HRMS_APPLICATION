import React, { useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

export default function BulkImportModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileName = selectedFile.name.toLowerCase();

    const isValid = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!isValid) {
      toast.error("Please select an Excel or CSV file");
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };


const handleImport = async () => {
  if (!file) {
    toast.warning("Please select a file first");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post(
      "hr/employees/import/",
      formData
    );

    console.log("IMPORT STATUS:", response.status);
    console.log("IMPORT RESPONSE:", response.data);

    const result = response.data;

    toast.success(
      result?.message || "Import request completed"
    );

    if (onSuccess) {
      await onSuccess();
    }
  } catch (err) {
    console.error("Import status:", err?.response?.status);
    console.error("Import response:", err?.response?.data);
    console.error("Import error:", err);

    const data = err?.response?.data;

    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      "Import failed. Check the browser console and Django terminal.";

    toast.error(message);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Import Employees
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload an Excel or CSV file to import employees.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* File Upload */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
          <input
            type="file"
            id="employee-import-file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <label
            htmlFor="employee-import-file"
            className="cursor-pointer"
          >
            <div className="mb-3 text-4xl">📊</div>

            <p className="font-medium text-gray-700">
              Click to select Excel/CSV file
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Supported: .xlsx, .xls, .csv
            </p>
          </label>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-800">
              Selected file
            </p>

            <p className="mt-1 break-all text-sm text-blue-600">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={!file || loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import Employees"}
          </button>
        </div>
      </div>
    </div>
  );
}
