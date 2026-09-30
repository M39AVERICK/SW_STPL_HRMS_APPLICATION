import React from "react";
import API from "../api"; // Adjust path if api.js is in src/utils/api or src/api
import { toast } from "react-toastify";

export default function EmployeeModal({
  modal,
  setModal,
  step,
  setStep,
  form,
  setForm,
  departments,
  employees,
  reload,
}) {
  const steps = [
    "Personal Info",
    "Contact & Address",
    "Employment & Job",
    "Payroll & Salary",
    "Bank Details",
    "Identity & Docs",
    "Emergency & Extra",
  ];

  // Helper for nested state updates
  const handleChange = (e, section = null) => {
    const { name, value, type, checked, files } = e.target;
    const fieldValue = type === "checkbox" ? checked : files ? files[0] : value;

    if (section) {
      setForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: fieldValue,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Append top-level fields
      Object.keys(form).forEach((key) => {
        if (typeof form[key] === "object" && form[key] !== null && !(form[key] instanceof File)) {
          formData.append(key, JSON.stringify(form[key]));
        } else if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });

      if (modal === "add") {
        await API.post("hr/employees/", formData);
        toast.success("Employee added successfully!");
      } else if (modal === "edit") {
        await API.put(`hr/employees/${form.id}/`, formData);
        toast.success("Employee updated successfully!");
      }

      setModal(null);
      reload();
    } catch (err) {
      console.error(err);
      toast.error("Error saving employee data");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-wider">
            {modal === "add" && "➕ Add New Employee"}
            {modal === "edit" && "✏️ Edit Employee Details"}
            {modal === "view" && "👁 View Employee Profile"}
          </h2>
          <button
            onClick={() => setModal(null)}
            className="text-white hover:bg-blue-700 rounded-lg p-2 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Step Wizard Nav */}
        <div className="bg-gray-100 p-3 border-b flex overflow-x-auto gap-2">
          {steps.map((st, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                step === index
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              {index + 1}. {st}
            </button>
          ))}
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  required
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={form.middle_name || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  required
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Gender</label>
                <select
                  name="gender"
                  value={form.gender || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Marital Status</label>
                <select
                  name="marital_status"
                  value={form.marital_status || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Father's Name</label>
                <input
                  type="text"
                  name="father_name"
                  value={form.father_name || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Mother's Name</label>
                <input
                  type="text"
                  name="mother_name"
                  value={form.mother_name || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Blood Group</label>
                <input
                  type="text"
                  name="blood_group"
                  value={form.blood_group || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 1: Contact & Address */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600">Official Email *</label>
                <input
                  type="email"
                  name="official_email"
                  value={form.official_email || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  required
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Personal Email</label>
                <input
                  type="email"
                  name="personal_email"
                  value={form.personal_email || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Phone Number *</label>
                <input
                  type="text"
                  name="phone_number"
                  value={form.phone_number || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  required
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.extra?.city || ""}
                  onChange={(e) => handleChange(e, "extra")}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-600">Current Address</label>
                <textarea
                  name="current_address"
                  value={form.extra?.current_address || ""}
                  onChange={(e) => handleChange(e, "extra")}
                  disabled={modal === "view"}
                  rows="2"
                  className="w-full border rounded-lg p-2 mt-1"
                ></textarea>
              </div>
            </div>
          )}

          {/* Step 2: Employment & Job */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600">Department</label>
                <select
                  name="department"
                  value={form.department || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Designation / Position</label>
                <input
                  type="text"
                  name="position"
                  value={form.position || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Employment Type</label>
                <select
                  name="employment_type"
                  value={form.employment_type || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                >
                  <option value="">Select Type</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Joining Date</label>
                <input
                  type="date"
                  name="joining_date"
                  value={form.joining_date || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Work Location</label>
                <input
                  type="text"
                  name="work_location"
                  value={form.work_location || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active ?? true}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-5 h-5"
                />
                <label className="font-semibold text-gray-700">Active Employee</label>
              </div>
            </div>
          )}

          {/* Step 3: Payroll & Salary */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600">Annual CTC / Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={form.salary || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">PF Number</label>
                <input
                  type="text"
                  name="pf_number"
                  value={form.pf_number || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">UAN Number</label>
                <input
                  type="text"
                  name="uan"
                  value={form.uan || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 4: Bank Details */}
          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={form.bank?.bank_name || ""}
                  onChange={(e) => handleChange(e, "bank")}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder_name"
                  value={form.bank?.account_holder_name || ""}
                  onChange={(e) => handleChange(e, "bank")}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  value={form.bank?.account_number || ""}
                  onChange={(e) => handleChange(e, "bank")}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={form.bank?.ifsc_code || ""}
                  onChange={(e) => handleChange(e, "bank")}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 5: Identity & Docs */}
          {step === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600">PAN Card Number</label>
                <input
                  type="text"
                  name="pan"
                  value={form.pan || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1 uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Aadhaar Card Number</label>
                <input
                  type="text"
                  name="aadhaar"
                  value={form.aadhaar || ""}
                  onChange={handleChange}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 6: Emergency & Extra */}
          {step === 6 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={form.extra?.emergency_contact_name || ""}
                  onChange={(e) => handleChange(e, "extra")}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Emergency Contact Number</label>
                <input
                  type="text"
                  name="emergency_contact_number"
                  value={form.extra?.emergency_contact_number || ""}
                  onChange={(e) => handleChange(e, "extra")}
                  disabled={modal === "view"}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-600">Remarks / Notes</label>
                <textarea
                  name="remarks"
                  value={form.extra?.remarks || ""}
                  onChange={(e) => handleChange(e, "extra")}
                  disabled={modal === "view"}
                  rows="2"
                  className="w-full border rounded-lg p-2 mt-1"
                ></textarea>
              </div>
            </div>
          )}

          {/* Footer Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t mt-4">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex gap-3">
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
                >
                  Next
                </button>
              ) : (
                modal !== "view" && (
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold"
                  >
                    Save Employee
                  </button>
                )
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}