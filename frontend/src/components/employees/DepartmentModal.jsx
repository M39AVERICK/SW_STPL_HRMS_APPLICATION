import React, { useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";

export default function DepartmentModal({
  departments = [],
  onClose,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleAddDepartment = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.warning("Please enter a department name");
      return;
    }

    try {
      setLoading(true);

      await API.post("hr/departments/", {
        name: trimmedName,
      });

      toast.success("Department added successfully");

      setName("");

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error("Add department error:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.name?.[0] ||
        "Failed to add department";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await API.delete(`hr/departments/${id}/`);

      toast.success("Department deleted successfully");

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error("Delete department error:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete department";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Manage Departments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add or remove employee departments.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Add Department */}
        <form
          onSubmit={handleAddDepartment}
          className="border-b px-6 py-5"
        >
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Department Name
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Human Resources"
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>

        {/* Department List */}
        <div className="max-h-80 overflow-y-auto px-6 py-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Existing Departments
          </h3>

          {departments.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-5 text-center text-sm text-gray-500">
              No departments found.
            </div>
          ) : (
            <div className="space-y-2">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {department.name}
                    </p>

                    {department.id && (
                      <p className="text-xs text-gray-400">
                        ID: {department.id}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteDepartment(department.id)
                    }
                    disabled={deletingId === department.id}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === department.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
