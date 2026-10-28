import React, { useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { Download, FileSpreadsheet } from "lucide-react";

export default function BulkImportModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const downloadTemplate = async () => {
    try {
      const response = await API.get("hr/employees/import-template/", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "employee_import_template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Could not download the employee import template.");
    }
  };

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
    setImportResult(null);
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
    setImportResult(result);
    if (result?.failed) {
      toast.warning(`${result.created || 0} employee(s) imported; ${result.failed} row(s) need correction.`);
      await onSuccess?.({ keepOpen: true });
    } else {
      toast.success(result?.message || "Employee import completed.");
      if (onSuccess) await onSuccess();
    }
  } catch (err) {
    console.error("Import status:", err?.response?.status);
    console.error("Import response:", err?.response?.data);
    console.error("Import error:", err);

    const data = err?.response?.data;
    if (data?.errors) setImportResult(data);

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
              Download the sample workbook first. Fill the Employees sheet and upload it here.
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

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet size={20} className="mt-0.5 shrink-0 text-blue-700" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-blue-900">Use the import guide</p>
              <p className="mt-1 text-xs leading-5 text-blue-800">Required: first name, last name, phone, official email, position, joining date, salary, PAN, and Aadhaar. Employment Type: Full Time, Intern, Contract, or Part Time. PF Number can be at most 20 characters.</p>
              <button type="button" onClick={downloadTemplate} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"><Download size={15}/> Download sample workbook</button>
            </div>
          </div>
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

        {importResult?.errors?.length > 0 && (
          <div className="mt-4 max-h-56 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">Correct these spreadsheet rows, then upload the file again</p>
            <ul className="mt-2 space-y-2 text-xs text-amber-900">
              {importResult.errors.map((item, index) => {
                const details = typeof item.error === "string"
                  ? item.error
                  : Object.entries(item.error || {}).map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(" ") : messages}`).join("; ");
                return <li key={`${item.row}-${index}`}><strong>Row {item.row}:</strong> {details}</li>;
              })}
            </ul>
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
