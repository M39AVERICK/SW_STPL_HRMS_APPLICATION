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

// ======================================================
// TABS
// ======================================================

const TABS = [
  "Personal",
  "Professional",
  "Contact",
  "Identity",
  "Bank",
  "Extra",
  "Documents",
];

// ======================================================
// REQUIRED FIELDS
// ======================================================

const REQUIRED_FIELDS = {
  Personal: [
    "first_name",
    "last_name",
    "gender",
    "date_of_birth",
    "marital_status",
    "blood_group",
    "nationality",
    "father_name",
    "mother_name",
  ],

  Professional: [
    "department",
    "position",
    "employee_type",
    "employment_type",
    "joining_date",
  ],

  Contact: [
    "official_email",
    "phone_number",
    "current_address",
    "city",
    "state",
    "country",
    "postal_code",
    "emergency_contact_name",
    "emergency_contact_number",
    "emergency_contact_relation",
  ],

  Identity: [
    "pan",
    "aadhaar",
  ],

  Bank: [
    "bank_name",
    "account_holder_name",
    "account_number",
    "ifsc_code",
    "branch_name",
    "account_type",
  ],

  Extra: [],

  Documents: [],
};

// ======================================================
// FIELD LABELS
// ======================================================

const FIELD_LABELS = {
  first_name: "First Name",
  last_name: "Last Name",
  gender: "Gender",
  date_of_birth: "Date of Birth",
  marital_status: "Marital Status",
  blood_group: "Blood Group",
  nationality: "Nationality",
  father_name: "Father Name",
  mother_name: "Mother Name",

  department: "Department",
  position: "Position",
  employee_type: "Employee Type",
  employment_type: "Employment Type",
  joining_date: "Joining Date",

  official_email: "Official Email",
  personal_email: "Personal Email",
  phone_number: "Phone Number",

  current_address: "Current Address",
  permanent_address: "Permanent Address",
  city: "City",
  state: "State",
  country: "Country",
  postal_code: "Postal Code",

  emergency_contact_name: "Emergency Contact Name",
  emergency_contact_number: "Emergency Contact Number",
  emergency_contact_relation: "Emergency Contact Relation",

  pan: "PAN",
  aadhaar: "Aadhaar",

  bank_name: "Bank Name",
  account_holder_name: "Account Holder Name",
  account_number: "Account Number",
  ifsc_code: "IFSC Code",
  branch_name: "Branch Name",
  account_type: "Account Type",
};

// ======================================================
// EMPTY CHECK
// ======================================================

const isEmpty = (value) => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  return false;
};

// ======================================================
// FIELD VALIDATION
// ======================================================

const validateField = (field, value) => {
  if (isEmpty(value)) {
    return false;
  }

  // Email
  if (
    field === "official_email" ||
    field === "personal_email"
  ) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(value).trim()
    );
  }

  // Phone
  if (
    field === "phone_number" ||
    field === "emergency_contact_number"
  ) {
    const digits = String(value).replace(/\D/g, "");
    return digits.length === 10;
  }

  // PAN
  if (field === "pan") {
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(
      String(value).trim()
    );
  }

  // Aadhaar
  if (field === "aadhaar") {
    const digits = String(value).replace(/\D/g, "");
    return digits.length === 12;
  }

  // IFSC
  if (field === "ifsc_code") {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(
      String(value).trim()
    );
  }

  return true;
};

// ======================================================
// VALIDATE TAB
// ======================================================

const validateTab = (tab, formData) => {
  const fields = REQUIRED_FIELDS[tab] || [];

  const errors = {};

  fields.forEach((field) => {
    const value = formData?.[field];

    if (!validateField(field, value)) {
      errors[field] = true;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ======================================================
// GET FIELD LABEL
// ======================================================

const getFieldLabel = (field) => {
  return (
    FIELD_LABELS[field] ||
    field
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  );
};

// ======================================================
// COMPONENT
// ======================================================

export default function ModalContainer({
  modal,
  employee,
  departments,
  employees,
  onClose,
  onSuccess,
}) {
  // ====================================================
  // STATE
  // ====================================================

  const [activeTab, setActiveTab] =
    useState("Personal");

  const [tabStatus, setTabStatus] =
    useState({});

  const [tabErrors, setTabErrors] =
    useState({});

  const [visitedTabs, setVisitedTabs] =
    useState({});

  const [saving, setSaving] =
    useState(false);

  /*
   * IMPORTANT
   *
   * After creating a new employee, this stores
   * the newly-created employee ID.
   *
   * This allows the other tabs to use PATCH.
   */
  const [employeeId, setEmployeeId] =
    useState(employee?.id || null);

  // ====================================================
  // INITIAL FORM DATA
  // ====================================================

  const getInitialFormData = (emp) => {
    // ==================================================
    // NEW EMPLOYEE
    // ==================================================

    if (!emp) {
      return {
        // PERSONAL
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",

        marital_status: "",
        blood_group: "",
        nationality: "Indian",

        father_name: "",
        mother_name: "",

        // PROFESSIONAL
        department: "",
        position: "",

        employee_type: "Permanent",
        employment_type: "Full Time",

        joining_date: "",

        reporting_manager: "",
        work_location: "",
        salary: "",

        // CONTACT
        official_email: "",
        personal_email: "",
        phone_number: "",

        current_address: "",
        permanent_address: "",

        city: "",
        state: "",
        country: "India",
        postal_code: "",

        emergency_contact_name: "",
        emergency_contact_number: "",
        emergency_contact_relation: "",

        // IDENTITY
        pan: "",
        aadhaar: "",
        uan: "",
        pf_number: "",

        // STATUS
        is_active: true,
        profile_picture: null,

        // BANK
        bank_name: "",
        account_holder_name: "",
        account_number: "",
        ifsc_code: "",
        branch_name: "",
        account_type: "SAVINGS",

        // EXTRA
        experience_years: "",
        asset_id: "",
        laptop_number: "",
        skills: "",
        remarks: "",

        // DOCUMENTS
        documents: {},
      };
    }

    // ==================================================
    // EXISTING EMPLOYEE
    // ==================================================

    const bank =
      emp.bank_details ||
      emp.bank ||
      {};

    const extra =
      emp.extra_details ||
      emp.extra ||
      {};

    return {
      ...emp,

      // PERSONAL

      first_name:
        emp.first_name || "",

      middle_name:
        emp.middle_name || "",

      last_name:
        emp.last_name || "",

      gender:
        emp.gender || "",

      date_of_birth:
        emp.date_of_birth || "",

      marital_status:
        emp.marital_status || "",

      blood_group:
        emp.blood_group || "",

      nationality:
        emp.nationality || "",

      father_name:
        emp.father_name || "",

      mother_name:
        emp.mother_name || "",

      // PROFESSIONAL

      department:
        emp.department?.id ??
        emp.department ??
        "",

      position:
        emp.position || "",

      employee_type:
        emp.employee_type ||
        "Permanent",

      employment_type:
        emp.employment_type ||
        "Full Time",

      joining_date:
        emp.joining_date || "",

      reporting_manager:
        emp.reporting_manager?.id ??
        emp.reporting_manager ??
        "",

      work_location:
        emp.work_location || "",

      salary:
        emp.salary ?? "",

      // CONTACT

      official_email:
        emp.official_email || "",

      personal_email:
        emp.personal_email || "",

      phone_number:
        emp.phone_number || "",

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

      // IDENTITY

      pan:
        emp.pan || "",

      aadhaar:
        emp.aadhaar || "",

      uan:
        emp.uan || "",

      pf_number:
        emp.pf_number || "",

      // BANK

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

      // EXTRA

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

      // PROFILE

      profile_picture:
        emp.profile_picture ||
        null,

      // DOCUMENTS

      documents:
        emp.documents || {},
    };
  };

  // ====================================================
  // FORM DATA
  // ====================================================

  const [formData, setFormData] =
    useState(() =>
      getInitialFormData(employee)
    );

  // ====================================================
  // EMPLOYEE CHANGE
  // ====================================================

  useEffect(() => {
    const data =
      getInitialFormData(employee);

    setFormData(data);

    setEmployeeId(employee?.id || null);

    setTabStatus({});
    setTabErrors({});
    setVisitedTabs({});
    setActiveTab("Personal");
    setSaving(false);
  }, [employee]);

  // ====================================================
  // TAB VALIDATION STATUS
  // ====================================================

  useEffect(() => {
    const newStatus = {};
    const newErrors = {};

    TABS.forEach((tab) => {
      if (!visitedTabs[tab]) {
        newStatus[tab] = null;
        newErrors[tab] = {};
        return;
      }

      const result =
        validateTab(
          tab,
          formData
        );

      newStatus[tab] =
        result.valid;

      newErrors[tab] =
        result.errors;
    });

    setTabStatus(newStatus);
    setTabErrors(newErrors);
  }, [
    formData,
    visitedTabs,
  ]);

  // ====================================================
  // READ ONLY
  // ====================================================

  const isReadOnly =
    modal === "view";

  // ====================================================
  // INPUT CHANGE
  // ====================================================

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

    // ==================================================
    // DOCUMENT FIELD
    // ==================================================

    if (
      name.startsWith("documents.")
    ) {
      const documentName =
        name.split(".")[1];

      setFormData((prev) => ({
        ...prev,

        documents: {
          ...(prev.documents || {}),

          [documentName]:
            newValue,
        },
      }));

      return;
    }

    // ==================================================
    // NORMAL FIELD
    // ==================================================

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // ====================================================
  // TAB INDEX
  // ====================================================

  const getTabIndex = (tab) => {
    return TABS.indexOf(tab);
  };

  // ====================================================
  // VALIDATE CURRENT TAB
  // ====================================================

  const validateCurrentTab = () => {
    const result =
      validateTab(
        activeTab,
        formData
      );

    setVisitedTabs((prev) => ({
      ...prev,
      [activeTab]: true,
    }));

    setTabErrors((prev) => ({
      ...prev,
      [activeTab]:
        result.errors,
    }));

    setTabStatus((prev) => ({
      ...prev,
      [activeTab]:
        result.valid,
    }));

    if (!result.valid) {
      const invalidFields =
        Object.keys(
          result.errors
        );

      const fieldNames =
        invalidFields.map(
          getFieldLabel
        );

      console.log(
        `${activeTab} validation failed:`,
        invalidFields
      );

      toast.error(
        `${activeTab}: Please complete ${fieldNames.join(
          ", "
        )}`
      );
    }

    return result.valid;
  };

  // ====================================================
  // CREATE FORMDATA
  // ====================================================

  const buildFormData = () => {
    const data =
      new FormData();

    // ==================================================
    // NORMAL EMPLOYEE FIELDS
    // ==================================================

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
      const value =
        formData[field];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        data.append(
          field,
          value
        );
      }
    });

    // ==================================================
    // PROFILE PICTURE
    // ==================================================

    if (
      formData.profile_picture instanceof File
    ) {
      data.append(
        "profile_picture",
        formData.profile_picture
      );
    }

    // ==================================================
    // BANK
    // ==================================================

    const bankFields = [
      "bank_name",
      "account_holder_name",
      "account_number",
      "ifsc_code",
      "branch_name",
      "account_type",
    ];

    bankFields.forEach((field) => {
      const value =
        formData[field];

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

    // ==================================================
    // EXTRA + CONTACT
    // ==================================================

    const extraFields = [
      "current_address",
      "permanent_address",
      "city",
      "state",
      "country",
      "postal_code",

      "emergency_contact_name",
      "emergency_contact_number",
      "emergency_contact_relation",

      "experience_years",
      "asset_id",
      "laptop_number",
      "skills",
      "remarks",
    ];

    extraFields.forEach((field) => {
      const value =
        formData[field];

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

    // ==================================================
    // DOCUMENTS
    // ==================================================

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

    return data;
  };

  // ====================================================
  // DEBUG FORMDATA
  // ====================================================

  const debugFormData = (data) => {
    console.log(
      "======================================"
    );

    console.log(
      "EMPLOYEE FORM DATA"
    );

    console.log(
      "Active Tab:",
      activeTab
    );

    console.log(
      "Employee ID:",
      employeeId
    );

    console.log(
      "Form State:",
      formData
    );

    console.log(
      "======================================"
    );

    for (const [
      key,
      value,
    ] of data.entries()) {
      console.log(
        key,
        ":",
        value
      );
    }

    console.log(
      "======================================"
    );
  };

  // ====================================================
  // SAVE CURRENT TAB
  // ====================================================

  const handleSaveCurrentTab = async () => {
    if (isReadOnly) {
      return;
    }

    // -----------------------------------------------
    // Validate current tab
    // -----------------------------------------------

    const valid =
      validateCurrentTab();

    if (!valid) {
      return;
    }

    setSaving(true);

    try {
      const data =
        buildFormData();

      debugFormData(data);

      // =================================================
      // NEW EMPLOYEE
      // =================================================

      if (!employeeId) {
        /*
         * IMPORTANT:
         *
         * Django create normally expects all required
         * employee fields.
         *
         * Therefore for a NEW employee we create only
         * when all required tabs are complete.
         */

        for (const tab of TABS) {
          const result =
            validateTab(
              tab,
              formData
            );

          if (!result.valid) {
            const invalidFields =
              Object.keys(
                result.errors
              );

            const fieldNames =
              invalidFields.map(
                getFieldLabel
              );

            setActiveTab(tab);

            setVisitedTabs((prev) => ({
              ...prev,
              [tab]: true,
            }));

            setTabStatus((prev) => ({
              ...prev,
              [tab]: false,
            }));

            setTabErrors((prev) => ({
              ...prev,
              [tab]:
                result.errors,
            }));

            toast.error(
              `${tab}: Please complete ${fieldNames.join(
                ", "
              )}`
            );

            return;
          }
        }

        const response =
          await API.post(
            "hr/employees/",
            data
          );

        console.log(
          "EMPLOYEE CREATED:",
          response.data
        );

        const newId =
          response?.data?.id;

        if (newId) {
          setEmployeeId(newId);

          setFormData((prev) => ({
            ...prev,
            id: newId,
          }));
        }

        toast.success(
          "Employee created successfully"
        );

        onSuccess();

        return;
      }

      // =================================================
      // EXISTING EMPLOYEE
      // =================================================

      /*
       * PATCH is important here.
       *
       * PATCH allows us to save only the current
       * employee changes instead of replacing the
       * entire employee object.
       */

      const response =
        await API.patch(
          `hr/employees/${employeeId}/`,
          data
        );

      console.log(
        "EMPLOYEE TAB SAVED:",
        response.data
      );

      toast.success(
        `${activeTab} saved successfully`
      );

      onSuccess();

    } catch (error) {
      console.log(
        "======================================"
      );

      console.log(
        "SAVE EMPLOYEE ERROR"
      );

      console.log(
        "FULL ERROR:",
        error
      );

      console.log(
        "STATUS:",
        error?.response?.status
      );

      console.log(
        "DATA:",
        error?.response?.data
      );

      console.log(
        "HEADERS:",
        error?.response?.headers
      );

      console.log(
        "MESSAGE:",
        error?.message
      );

      console.log(
        "======================================"
      );

      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to save employee"
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // NEXT
  // ====================================================

  const handleNext = () => {
    if (isReadOnly) {
      return;
    }

    const valid =
      validateCurrentTab();

    if (!valid) {
      return;
    }

    const currentIndex =
      getTabIndex(activeTab);

    if (
      currentIndex <
      TABS.length - 1
    ) {
      setActiveTab(
        TABS[currentIndex + 1]
      );
    }
  };

  // ====================================================
  // PREVIOUS
  // ====================================================

  const handlePrevious = () => {
    const currentIndex =
      getTabIndex(activeTab);

    if (currentIndex > 0) {
      setActiveTab(
        TABS[currentIndex - 1]
      );
    }
  };

  // ====================================================
  // TAB CLICK
  // ====================================================

  const handleTabClick = (tab) => {
    if (isReadOnly) {
      setActiveTab(tab);
      return;
    }

    const targetIndex =
      getTabIndex(tab);

    const currentIndex =
      getTabIndex(activeTab);

    // Going backward
    if (
      targetIndex <
      currentIndex
    ) {
      setActiveTab(tab);
      return;
    }

    // Same tab
    if (
      targetIndex ===
      currentIndex
    ) {
      return;
    }

    // Immediate next
    if (
      targetIndex ===
      currentIndex + 1
    ) {
      const valid =
        validateCurrentTab();

      if (valid) {
        setActiveTab(tab);
      }

      return;
    }

    toast.info(
      "Please complete the current section first."
    );
  };

  // ====================================================
  // FINAL SUBMIT
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    /*
     * The actual save is now handled by
     * handleSaveCurrentTab().
     *
     * This keeps the form behavior predictable.
     */

    await handleSaveCurrentTab();
  };

  // ====================================================
  // DOCUMENT ERROR HANDLER
  // ====================================================

  const handleDocumentError = (error) => {
    console.error(
      "DOCUMENT TAB ERROR:",
      error
    );
  };

  // ====================================================
  // CURRENT TAB
  // ====================================================

  const currentIndex =
    getTabIndex(activeTab);

  const isLastTab =
    currentIndex ===
    TABS.length - 1;

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4">

      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">

        {/* ==================================================
            HEADER
        ================================================== */}

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
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            &times;
          </button>

        </div>

        {/* ==================================================
            TABS
        ================================================== */}

        <div className="flex border-b border-gray-200 bg-white overflow-x-auto">

          {TABS.map((tab) => {
            const isActive =
              activeTab === tab;

            const isValid =
              tabStatus[tab];

            let colorClass =
              "border-transparent text-gray-500";

            if (isActive) {
              colorClass =
                "border-blue-600 text-blue-600";
            } else if (
              isValid === true
            ) {
              colorClass =
                "border-green-500 text-green-600";
            } else if (
              isValid === false
            ) {
              colorClass =
                "border-red-500 text-red-600";
            }

            return (
              <button
                key={tab}
                type="button"
                onClick={() =>
                  handleTabClick(tab)
                }
                className={`
                  px-4
                  py-3
                  text-sm
                  font-medium
                  border-b-2
                  whitespace-nowrap
                  ${colorClass}
                `}
              >

                <span className="flex items-center gap-2">

                  {tab}

                  {isValid === true && (
                    <span className="text-green-600 font-bold">
                      ✓
                    </span>
                  )}

                  {isValid === false && (
                    <span className="text-red-600 font-bold">
                      !
                    </span>
                  )}

                </span>

              </button>
            );
          })}

        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="p-6 flex-1 overflow-y-auto"
        >

          {/* =================================================
              PERSONAL
          ================================================= */}

          {activeTab === "Personal" && (
            <StepPersonal
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {/* =================================================
              PROFESSIONAL
          ================================================= */}

          {activeTab === "Professional" && (
            <StepProfessional
              formData={formData}
              onChange={handleChange}
              departments={departments}
              employees={employees}
              readOnly={isReadOnly}
            />
          )}

          {/* =================================================
              CONTACT
          ================================================= */}

          {activeTab === "Contact" && (
            <StepContact
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {/* =================================================
              IDENTITY
          ================================================= */}

          {activeTab === "Identity" && (
            <StepIdentity
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {/* =================================================
              BANK
          ================================================= */}

          {activeTab === "Bank" && (
            <StepBank
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {/* =================================================
              EXTRA
          ================================================= */}

          {activeTab === "Extra" && (
            <StepExtra
              formData={formData}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          )}

          {/* =================================================
              DOCUMENTS
          ================================================= */}

          {activeTab === "Documents" && (
            <div
              onErrorCapture={handleDocumentError}
            >
              <StepDocuments
                formData={formData}
                readOnly={isReadOnly}
                onChange={handleChange}
              />
            </div>
          )}

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="mt-6 pt-4 border-t border-gray-200">

            <div className="flex justify-between items-center">

              {/* =================================================
                  LEFT
              ================================================= */}

              <div className="flex gap-3">

                {currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                )}

              </div>

              {/* =================================================
                  RIGHT
              ================================================= */}

              <div className="flex gap-3">

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Close
                </button>

                {/* =================================================
                    SAVE CURRENT TAB
                ================================================= */}

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={
                      handleSaveCurrentTab
                    }
                    disabled={saving}
                    className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save"}
                  </button>
                )}

                {/* =================================================
                    NEXT
                ================================================= */}

                {!isReadOnly &&
                  !isLastTab && (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={saving}
                      className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Next →
                    </button>
                  )}

              </div>

            </div>

            {/* =================================================
                SAVE INFORMATION
            ================================================= */}

            {!isReadOnly && (
              <div className="mt-3 text-right">

                {employeeId ? (
                  <p className="text-xs text-gray-500">
                    Changes in this section can be
                    saved independently.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Complete all required sections
                    before creating the employee.
                  </p>
                )}

              </div>
            )}

          </div>

        </form>

      </div>

    </div>
  );
}
