// src/components/employee/EmployeeModal/ModalContainer.jsx
import React, { useState, useEffect } from "react";
import API from "../../../api";
import { toast } from "react-toastify";

import StepPersonal from "./StepPersonal";
import StepProfessional from "./StepProfessional";
import StepContact from "./StepContact";
import StepIdentity from "./StepIdentity";
import StepBank from "./StepBank";
import StepExtra from "./StepExtra";
import StepDocuments from "./StepDocuments";

const TABS = [
  "Personal",
  "Professional",
  "Contact",
  "Identity",
  "Bank",
  "Extra",
  "Documents",
];

export default function ModalContainer({
  modal,
  employee,
  departments,
  employees,
  onClose,
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState("Personal");

  const getInitialFormData = (emp) => {
    // ==========================================
    // NEW EMPLOYEE
    // ==========================================
    if (!emp) {
      return {
        // Personal
        first_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",
        department: "",
        position: "",
        employee_type: "Permanent",
        employment_type: "Full Time",

        // Contact / Employee fields
        official_email: "",
        personal_email: "",
        phone_number: "",

        is_active: true,
        profile_picture: null,

        // Bank fields
        bank_name: "",
        account_holder_name: "",
        account_number: "",
        ifsc_code: "",
        branch_name: "",
        account_type: "SAVINGS",

        // Extra fields
        experience_years: "",
        asset_id: "",
        laptop_number: "",
        skills: "",
        remarks: "",

        // Contact fields
        current_address: "",
        permanent_address: "",
        city: "",
        state: "",
        country: "India",
        postal_code: "",
        emergency_contact_name: "",
        emergency_contact_number: "",
        emergency_contact_relation: "",

        // Documents
        documents: {},
      };
    }

    // ==========================================
    // EXISTING EMPLOYEE
    // ==========================================

    const bank = emp.bank_details || emp.bank || {};
    const extra = emp.extra_details || emp.extra || {};

    
    return {
      // Keep all existing employee fields
      ...emp,

      // ==========================================
      // BASIC / PERSONAL
      // ==========================================

      department:
        emp.department?.id ||
        emp.department ||
        "",

      // ==========================================
      // CONTACT - NORMAL EMPLOYEE FIELDS
      // ==========================================

      official_email:
        emp.official_email || "",

      personal_email:
        emp.personal_email || "",

      phone_number:
        emp.phone_number || "",

      // ==========================================
      // BANK MAPPING
      // ==========================================

      bank_name:
        bank.bank_name ||
        emp.bank_name ||
        "",

      account_holder_name:
        bank.account_holder_name ||
        emp.account_holder_name ||
        "",

      account_number:
        bank.account_number ||
        emp.account_number ||
        "",

      ifsc_code:
        bank.ifsc_code ||
        emp.ifsc_code ||
        "",

      branch_name:
        bank.branch_name ||
        emp.branch_name ||
        "",

      account_type:
        bank.account_type ||
        emp.account_type ||
        "SAVINGS",

      // ==========================================
      // EXTRA FIELDS
      // ==========================================

      experience_years:
        extra.experience_years ??
        emp.experience_years ??
        "",

      asset_id:
        extra.asset_id ||
        emp.asset_id ||
        "",

      laptop_number:
        extra.laptop_number ||
        emp.laptop_number ||
        "",

      skills:
        extra.skills ||
        emp.skills ||
        "",

      remarks:
        extra.remarks ||
        emp.remarks ||
        "",

      // ==========================================
      // CONTACT FIELDS
      // IMPORTANT:
      // These are saved as extra.field
      // so they must be loaded from `extra`
      // ==========================================

      current_address:
        extra.current_address ||
        emp.current_address ||
        "",

      permanent_address:
        extra.permanent_address ||
        emp.permanent_address ||
        "",

      city:
        extra.city ||
        emp.city ||
        "",

      state:
        extra.state ||
        emp.state ||
        "",

      country:
        extra.country ||
        emp.country ||
        "India",

      postal_code:
        extra.postal_code ||
        emp.postal_code ||
        "",

      emergency_contact_name:
        extra.emergency_contact_name ||
        emp.emergency_contact_name ||
        "",

      emergency_contact_number:
        extra.emergency_contact_number ||
        emp.emergency_contact_number ||
        "",

      emergency_contact_relation:
        extra.emergency_contact_relation ||
        emp.emergency_contact_relation ||
        "",

      // ==========================================
      // DOCUMENTS
      // ==========================================

      documents:
        emp.documents || {},
    };
  };

  // ==========================================
  // FORM STATE
  // ==========================================

  const [formData, setFormData] = useState(() =>
    getInitialFormData(employee)
  );

  // ==========================================
  // WHEN EMPLOYEE CHANGES
  // ==========================================

  useEffect(() => {
    const data = getInitialFormData(employee);

    
    setFormData(data);
  }, [employee]);

  const isReadOnly = modal === "view";

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = e.target;

    const newValue =
      type === "checkbox"
        ? checked
        : type === "file"
        ? files?.[0] || null
        : value;

    // ==========================================
    // NESTED DOCUMENT FIELD
    // ==========================================

    if (name.startsWith("documents.")) {
      const documentName = name.split(".")[1];

      setFormData((prev) => ({
        ...prev,

        documents: {
          ...(prev.documents || {}),
          [documentName]: newValue,
        },
      }));

      return;
    }

    // ==========================================
    // NORMAL FIELD
    // ==========================================

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isReadOnly) return;

    try {
      const data = new FormData();

      // ==========================================
      // NORMAL EMPLOYEE FIELDS
      // ==========================================

      const normalFields = [
        "first_name",
        "middle_name",
        "last_name",
        "gender",
        "date_of_birth",

        "phone_number",
        "official_email",
        "personal_email",

        "marital_status",
        "blood_group",
        "nationality",
        "father_name",
        "mother_name",

        "position",
        "employee_type",
        "reporting_manager",
        "employment_type",
        "department",
        "joining_date",
        "work_location",
        "salary",

        "pan",
        "aadhaar",
        "uan",
        "pf_number",

        "is_active",
      ];

      normalFields.forEach((field) => {
        const value = formData[field];

        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          data.append(field, value);
        }
      });

      // ==========================================
      // PROFILE PICTURE
      // ==========================================

      if (
        formData.profile_picture instanceof File
      ) {
        data.append(
          "profile_picture",
          formData.profile_picture
        );
      }

      // ==========================================
      // BANK
      // ==========================================

      const bankFields = [
        "bank_name",
        "account_holder_name",
        "account_number",
        "ifsc_code",
        "branch_name",
        "account_type",
      ];

      bankFields.forEach((field) => {
        const value = formData[field];

        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          data.append(
            `bank.${field}`,
            value
          );
        }
      });

      // ==========================================
      // EXTRA + CONTACT
      // ==========================================

      const extraFields = [
        // Contact
        "current_address",
        "permanent_address",
        "city",
        "state",
        "country",
        "postal_code",
        "emergency_contact_name",
        "emergency_contact_number",
        "emergency_contact_relation",

        // Extra
        "experience_years",
        "asset_id",
        "laptop_number",
        "skills",
        "remarks",
      ];

      extraFields.forEach((field) => {
        const value = formData[field];

        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          data.append(
            `extra.${field}`,
            value
          );
        }
      });

      // ==========================================
      // DOCUMENTS
      // ==========================================

      const documentFields = [
        "resume",
        "offer_letter",
        "pan_document",
        "aadhaar_document",
        "experience_certificate",
        "other_document",
      ];

      documentFields.forEach((field) => {
        const file =
          formData.documents?.[field];

        if (file instanceof File) {
          data.append(
            `documents.${field}`,
            file
          );
        }
      });

      // ==========================================
      // DEBUG FORM DATA
      // ==========================================

      

      
      // ==========================================
      // API REQUEST
      // ==========================================

      if (modal === "add") {
        await API.post(
          "hr/employees/",
          data
        );

        toast.success(
          "Employee created successfully"
        );
      }

      if (modal === "edit") {
        await API.put(
          `hr/employees/${formData.id}/`,
          data
        );

        toast.success(
          "Employee updated successfully"
        );
      }

      onSuccess();
      onClose();

    } catch (err) {
      console.error(
        "Backend Error Details:",
        err.response?.data ||
          err.message
      );

      const backendError =
        err.response?.data
          ? JSON.stringify(
              err.response.data
            )
          : "Error saving employee details";

      toast.error(
        `Save Failed: ${backendError}`
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">

          <h2 className="text-xl font-bold text-gray-800">
            {modal === "add" &&
              "Add New Employee"}

            {modal === "edit" &&
              `Edit Employee: ${
                formData.first_name || ""
              }`}

            {modal === "view" &&
              `Employee Details: ${
                formData.first_name || ""
              }`}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            &times;
          </button>

        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white overflow-x-auto">

          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() =>
                setActiveTab(tab)
              }
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}

        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex-1 overflow-y-auto"
        >

          {activeTab === "Personal" && (
            <StepPersonal
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {activeTab === "Professional" && (
            <StepProfessional
              formData={formData}
              onChange={handleChange}
              departments={departments}
              employees={employees}
              readOnly={isReadOnly}
            />
          )}

          {activeTab === "Contact" && (
            <StepContact
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {activeTab === "Identity" && (
            <StepIdentity
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {activeTab === "Bank" && (
            <StepBank
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {activeTab === "Extra" && (
            <StepExtra
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {activeTab === "Documents" && (
            <StepDocuments
              formData={formData}
              readOnly={isReadOnly}
              onChange={handleChange}
            />
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            )}

          </div>

        </form>
      </div>
    </div>
  );
}
