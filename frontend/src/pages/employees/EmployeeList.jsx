import { useEffect, useState } from "react";
import API from "../../api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function EmployeeList() {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [modal, setModal] = useState(null);
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");



  const openPreview = (emp) => {
    setPreviewDocs(emp.documents);
    setPreviewOpen(true);
};

const closePreview = () => {
    setPreviewOpen(false);
    setPreviewDocs(null);
};
  // ================= BULK SELECTION =================
const [selectedEmployees, setSelectedEmployees] = useState([]);

  
  const navigate = useNavigate();

  const emptyForm = {

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
  phone_number: "",
  official_email: "",
  personal_email: "",
  profile_picture: null,
  profile_picture_preview: "",
 
  // PROFESSIONAL
  position: "",
  employee_type: "",
  reporting_manager: "",
  department: "",
  employment_type: "",
  joining_date: "",
  work_location: "",
  salary: "",
  is_active: true,

  // IDENTITY
  pan: "",
  aadhaar: "",
  uan: "",
  pf_number: "",

  // BANK
  bank: {
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
    account_type: ""
  },

  // EXTRA
  extra: {
    current_address: "",
    permanent_address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    emergency_contact_relation: "",
    skills: "",
    experience_years: "",
    asset_id: "",
    laptop_number: "",
    remarks: ""
  },

  // DOCUMENTS
  documents: {
    pan_document: null,
    aadhaar_document: null,
    resume: null,
    offer_letter: null,
    experience_certificate: null,
    other_document: null
  }
};

  const [form, setForm] = useState(emptyForm);

  /* ================= LOAD ================= */
  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
}, [search, departmentFilter, statusFilter]);

  const loadEmployees = async () => {

    try {

        setLoading(true);

        const res = await API.get("hr/employees/");

        setEmployees(res.data);

    }

    catch(err){

        console.log(err);

    }

    finally{

        setLoading(false);

    }

};

  const loadDepartments = async () => {
    const res = await API.get("hr/departments/");
    setDepartments(res.data);
  };

  /* ================= OPEN ================= */
  const openAdd = () => {
    setForm(emptyForm);
    setStep(0);
    setModal("add");
  };
const openEdit = (emp) => {

  setForm({

    // ==========================
    // DEFAULT + MAIN OBJECT
    // ==========================
    ...emptyForm,
    ...emp,

    id: emp.id,

    // ==========================
    // PERSONAL INFORMATION
    // ==========================
    first_name: emp.first_name || "",
    middle_name: emp.middle_name || "",
    last_name: emp.last_name || "",

    gender: emp.gender || "",
    date_of_birth: emp.date_of_birth || "",

    marital_status: emp.marital_status || "",
    blood_group: emp.blood_group || "",
    nationality: emp.nationality || "Indian",

    father_name: emp.father_name || "",
    mother_name: emp.mother_name || "",

    phone_number: emp.phone_number || "",

    official_email: emp.official_email || "",
    personal_email: emp.personal_email || "",

    // keep image preview separately
    profile_picture: null,
    profile_picture_preview: emp.profile_picture || "",

    // ==========================
    // PROFESSIONAL INFORMATION
    // ==========================
    position: emp.position || "",

    employee_type: emp.employee_type || "",

    reporting_manager: emp.reporting_manager || "",

    department: emp.department || "",

    employment_type: emp.employment_type || "",

    joining_date: emp.joining_date || "",

    work_location: emp.work_location || "",

    salary: emp.salary || "",

    is_active: emp.is_active ?? true,

    // ==========================
    // IDENTITY
    // ==========================
    pan: emp.pan || "",

    aadhaar: emp.aadhaar || "",

    uan: emp.uan || "",

    pf_number: emp.pf_number || "",

    // ==========================
    // BANK DETAILS
    // ==========================
    bank: {

      bank_name: emp.bank?.bank_name || "",

      account_holder_name:
        emp.bank?.account_holder_name || "",

      account_number:
        emp.bank?.account_number || "",

      ifsc_code:
        emp.bank?.ifsc_code || "",

      branch_name:
        emp.bank?.branch_name || "",

      account_type:
        emp.bank?.account_type || ""

    },

    // ==========================
    // EXTRA DETAILS
    // ==========================
    extra: {

      current_address:
        emp.extra?.current_address || "",

      permanent_address:
        emp.extra?.permanent_address || "",

      city:
        emp.extra?.city || "",

      state:
        emp.extra?.state || "",

      country:
        emp.extra?.country || "India",

      postal_code:
        emp.extra?.postal_code || "",

      emergency_contact_name:
        emp.extra?.emergency_contact_name || "",

      emergency_contact_number:
        emp.extra?.emergency_contact_number || "",

      emergency_contact_relation:
        emp.extra?.emergency_contact_relation || "",

      skills:
        emp.extra?.skills || "",

      experience_years:
        emp.extra?.experience_years || "",

      asset_id:
        emp.extra?.asset_id || "",

      laptop_number:
        emp.extra?.laptop_number || "",

      remarks:
        emp.extra?.remarks || ""

    },

    // ==========================
    // DOCUMENTS
    // ==========================
    documents: {

      pan_document: null,
      pan_document_preview:
        emp.documents?.pan_document || "",

      aadhaar_document: null,
      aadhaar_document_preview:
        emp.documents?.aadhaar_document || "",

      resume: null,
      resume_preview:
        emp.documents?.resume || "",

      offer_letter: null,
      offer_letter_preview:
        emp.documents?.offer_letter || "",

      experience_certificate: null,
      experience_certificate_preview:
        emp.documents?.experience_certificate || "",

      other_document: null,
      other_document_preview:
        emp.documents?.other_document || ""

    }

  });

  setStep(0);
  setModal("edit");

};

  const openView = (emp) => {
    openEdit(emp);
    setModal("view");
  };

  /* ================= VALIDATION ================= */
  const validate = () => {

  // ===========================
  // PERSONAL INFORMATION
  // ===========================

  if (!form.first_name?.trim())
    return "First Name is required";

  if (!form.last_name?.trim())
    return "Last Name is required";

  if (!form.gender)
    return "Gender is required";

  if (!form.date_of_birth)
    return "Date of Birth is required";

  if (!form.phone_number?.trim())
    return "Phone Number is required";

  if (!form.personal_email?.trim())
    return "Personal Email is required";

  if (!form.official_email?.trim())
    return "Official Email is required";

  // ===========================
  // PROFESSIONAL INFORMATION
  // ===========================

  if (!form.position?.trim())
    return "Position is required";

  if (!form.department)
    return "Department is required";

  if (!form.employment_type)
    return "Employment Type is required";

  if (!form.joining_date)
    return "Joining Date is required";

  if (!form.work_location?.trim())
    return "Work Location is required";

  if (!form.salary)
    return "Salary is required";

  // ===========================
  // IDENTITY
  // ===========================

  if (!form.pan?.trim())
    return "PAN Number is required";

  if (!form.aadhaar?.trim())
    return "Aadhaar Number is required";

  // ===========================
  // BANK DETAILS
  // ===========================

  if (!form.bank?.bank_name?.trim())
    return "Bank Name is required";

  if (!form.bank?.account_holder_name?.trim())
    return "Account Holder Name is required";

  if (!form.bank?.account_number?.trim())
    return "Account Number is required";

  if (!form.bank?.ifsc_code?.trim())
    return "IFSC Code is required";

  // ===========================
  // ADDRESS
  // ===========================

  if (!form.extra?.current_address?.trim())
    return "Current Address is required";

  if (!form.extra?.city?.trim())
    return "City is required";

  if (!form.extra?.state?.trim())
    return "State is required";

  // ===========================
  // EMERGENCY CONTACT
  // ===========================

  if (!form.extra?.emergency_contact_name?.trim())
    return "Emergency Contact Name is required";

  if (!form.extra?.emergency_contact_number?.trim())
    return "Emergency Contact Number is required";

  // ===========================
  // SUCCESS
  // ===========================

  return null;
};
  /* ================= SAVE ================= */
  const save = async () => {

  const error = validate();

  if (error) {
    toast.error(error);
    return;
  }

  const formData = new FormData();

  // =====================================================
  // PERSONAL
  // =====================================================

  formData.append("first_name", form.first_name);
  formData.append("middle_name", form.middle_name || "");
  formData.append("last_name", form.last_name);

  formData.append("gender", form.gender);
  formData.append("date_of_birth", form.date_of_birth);

  formData.append("marital_status", form.marital_status || "");
  formData.append("blood_group", form.blood_group || "");
  formData.append("nationality", form.nationality || "Indian");

  formData.append("father_name", form.father_name || "");
  formData.append("mother_name", form.mother_name || "");

  formData.append("phone_number", form.phone_number);

  formData.append("official_email", form.official_email);
  formData.append("personal_email", form.personal_email);

  if (
    form.profile_picture &&
    typeof form.profile_picture !== "string"
  ) {
    formData.append(
      "profile_picture",
      form.profile_picture
    );
  }

  // =====================================================
  // PROFESSIONAL
  // =====================================================

  formData.append("position", form.position);

  formData.append("employee_type", form.employee_type);

  formData.append(
    "reporting_manager",
    form.reporting_manager || ""
  );

  formData.append(
    "department",
    form.department
  );

  formData.append(
    "employment_type",
    form.employment_type
  );

  formData.append(
    "joining_date",
    form.joining_date
  );

  formData.append(
    "work_location",
    form.work_location || ""
  );

  formData.append(
    "salary",
    form.salary
  );

  formData.append(
    "is_active",
    form.is_active
  );

  // =====================================================
  // IDENTITY
  // =====================================================

  formData.append("pan", form.pan);

  formData.append(
    "aadhaar",
    form.aadhaar
  );

  formData.append(
    "uan",
    form.uan || ""
  );

  formData.append(
    "pf_number",
    form.pf_number || ""
  );

  // =====================================================
  // BANK
  // =====================================================

  formData.append(
    "bank.bank_name",
    form.bank.bank_name
  );

  formData.append(
    "bank.account_holder_name",
    form.bank.account_holder_name
  );

  formData.append(
    "bank.account_number",
    form.bank.account_number
  );

  formData.append(
    "bank.ifsc_code",
    form.bank.ifsc_code
  );

  formData.append(
    "bank.branch_name",
    form.bank.branch_name
  );

  formData.append(
    "bank.account_type",
    form.bank.account_type
  );

  // =====================================================
  // EXTRA
  // =====================================================

  formData.append(
    "extra.current_address",
    form.extra.current_address
  );

  formData.append(
    "extra.permanent_address",
    form.extra.permanent_address
  );

  formData.append(
    "extra.city",
    form.extra.city
  );

  formData.append(
    "extra.state",
    form.extra.state
  );

  formData.append(
    "extra.country",
    form.extra.country
  );

  formData.append(
    "extra.postal_code",
    form.extra.postal_code
  );

  formData.append(
    "extra.emergency_contact_name",
    form.extra.emergency_contact_name
  );

  formData.append(
    "extra.emergency_contact_number",
    form.extra.emergency_contact_number
  );

  formData.append(
    "extra.emergency_contact_relation",
    form.extra.emergency_contact_relation
  );

  formData.append(
    "extra.skills",
    form.extra.skills
  );

  formData.append(
    "extra.experience_years",
    form.extra.experience_years
  );

  formData.append(
    "extra.asset_id",
    form.extra.asset_id
  );

  formData.append(
    "extra.laptop_number",
    form.extra.laptop_number
  );

  formData.append(
    "extra.remarks",
    form.extra.remarks
  );

  // =====================================================
  // DOCUMENTS
  // =====================================================

  if (
    form.documents.pan_document &&
    typeof form.documents.pan_document !== "string"
  ) {
    formData.append(
      "documents.pan_document",
      form.documents.pan_document
    );
  }

  if (
    form.documents.aadhaar_document &&
    typeof form.documents.aadhaar_document !== "string"
  ) {
    formData.append(
      "documents.aadhaar_document",
      form.documents.aadhaar_document
    );
  }

  if (
    form.documents.resume &&
    typeof form.documents.resume !== "string"
  ) {
    formData.append(
      "documents.resume",
      form.documents.resume
    );
  }

  if (
    form.documents.offer_letter &&
    typeof form.documents.offer_letter !== "string"
  ) {
    formData.append(
      "documents.offer_letter",
      form.documents.offer_letter
    );
  }

  if (
    form.documents.experience_certificate &&
    typeof form.documents.experience_certificate !== "string"
  ) {
    formData.append(
      "documents.experience_certificate",
      form.documents.experience_certificate
    );
  }

  if (
    form.documents.other_document &&
    typeof form.documents.other_document !== "string"
  ) {
    formData.append(
      "documents.other_document",
      form.documents.other_document
    );
  }

  try {

    if (modal === "add") {

      await API.post(
        "hr/employees/",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      toast.success(
        "Employee created successfully"
      );

    } else {

      await API.patch(
        `hr/employees/${form.id}/`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      toast.success(
        "Employee updated successfully"
      );
    }

    loadEmployees();
    setModal(null);

  } catch (err) {

    console.log(err.response?.data);

    toast.error(
      JSON.stringify(
        err.response?.data,
        null,
        2
      )
    );

  }

};
  /* ================= DELETE ================= */
  const deleteEmp = async (id) => {
    if (!window.confirm("Delete employee?")) return;
    await API.delete(`hr/employees/${id}/`);
    loadEmployees();
  };

  /* ================= FILTER ================= */
  const filtered = employees.filter((emp) => {

  const searchMatch =
    `${emp.first_name} ${emp.last_name}`
.toLowerCase()
.includes(search.toLowerCase())
||
    emp.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
    emp.position?.toLowerCase().includes(search.toLowerCase()) ||
    emp.official_email?.toLowerCase().includes(search.toLowerCase());

  const departmentMatch =
  !departmentFilter ||
  emp.department === Number(departmentFilter);

const statusMatch =
  statusFilter === ""
    ? true
    : statusFilter === "Active"
      ? emp.is_active
      : !emp.is_active;

return searchMatch && departmentMatch && statusMatch;
});
// ================= SORTING =================

const sortedEmployees = [...filtered].sort((a, b) => {

    if (!sortField) return 0;

    let valueA = a[sortField];
    let valueB = b[sortField];

    if (valueA === null || valueA === undefined) valueA = "";
    if (valueB === null || valueB === undefined) valueB = "";

    valueA = valueA.toString().toLowerCase();
    valueB = valueB.toString().toLowerCase();

    if (sortOrder === "asc") {
        return valueA.localeCompare(valueB);
    }

    return valueB.localeCompare(valueA);

});
const handleSort = (field) => {

    if (sortField === field) {

        setSortOrder(
            sortOrder === "asc"
                ? "desc"
                : "asc"
        );

    } else {

        setSortField(field);
        setSortOrder("asc");

    }

};
// ================= PAGINATION =================

const indexOfLastRecord = currentPage * recordsPerPage;

const indexOfFirstRecord =
  indexOfLastRecord - recordsPerPage;

const currentRecords = sortedEmployees.slice(
    indexOfFirstRecord,
    indexOfLastRecord
);

const totalPages =
  Math.ceil(filtered.length / recordsPerPage);

// ================= BULK DATA =================

const selectedData = employees.filter(emp =>
    selectedEmployees.includes(emp.id)
);


// ================= BULK EXPORT EXCEL =================

const bulkExportExcel = () => {

    const data = selectedData.map(emp => ({

        // ================= PERSONAL =================

        Employee_ID: emp.employee_id,

        First_Name: emp.first_name,

        Middle_Name: emp.middle_name,

        Last_Name: emp.last_name,

        Gender: emp.gender,

        Date_of_Birth: emp.date_of_birth,

        Marital_Status: emp.marital_status,

        Blood_Group: emp.blood_group,

        Nationality: emp.nationality,

        Father_Name: emp.father_name,

        Mother_Name: emp.mother_name,

        Phone_Number: emp.phone_number,

        Official_Email: emp.official_email,

        Personal_Email: emp.personal_email,

        // ================= PROFESSIONAL =================

        Department: emp.department_name,

        Position: emp.position,

        Employee_Type: emp.employee_type,

        Employment_Type: emp.employment_type,

        Reporting_Manager: emp.reporting_manager,

        Joining_Date: emp.joining_date,

        Work_Location: emp.work_location,

        Salary: emp.salary,

        Status: emp.is_active ? "Active" : "Inactive",

        // ================= IDENTITY =================

        PAN: emp.pan,

        Aadhaar: emp.aadhaar,

        UAN: emp.uan,

        PF_Number: emp.pf_number,

        // ================= BANK =================

        Bank_Name: emp.bank?.bank_name,

        Account_Holder_Name: emp.bank?.account_holder_name,

        Account_Number: emp.bank?.account_number,

        IFSC_Code: emp.bank?.ifsc_code,

        Branch_Name: emp.bank?.branch_name,

        Account_Type: emp.bank?.account_type,

        // ================= EXTRA =================

        Current_Address: emp.extra?.current_address,

        Permanent_Address: emp.extra?.permanent_address,

        City: emp.extra?.city,

        State: emp.extra?.state,

        Country: emp.extra?.country,

        Postal_Code: emp.extra?.postal_code,

        Emergency_Contact_Name: emp.extra?.emergency_contact_name,

        Emergency_Contact_Number: emp.extra?.emergency_contact_number,

        Emergency_Contact_Relation: emp.extra?.emergency_contact_relation,

        Skills: emp.extra?.skills,

        Experience_Years: emp.extra?.experience_years,

        Asset_ID: emp.extra?.asset_id,

        Laptop_Number: emp.extra?.laptop_number,

        Remarks: emp.extra?.remarks,

        // ================= DOCUMENTS =================

        PAN_Document: emp.documents?.pan_document,

        Aadhaar_Document: emp.documents?.aadhaar_document,

        Resume: emp.documents?.resume,

        Offer_Letter: emp.documents?.offer_letter,

        Experience_Certificate: emp.documents?.experience_certificate,

        Other_Document: emp.documents?.other_document

    }));

    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    XLSX.writeFile(wb, "STPL-SelectedEmployees.xlsx");

};
// ================= BULK EXPORT PDF =================

const bulkExportPDF = () => {

    const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3"
});

    autoTable(doc, {
    head: [[
        "Employee ID",
        "First Name",
        "Middle Name",
        "Last Name",
        "Gender",
        "Phone",
        "Official Email",
        "Department",
        "Work Location",
        "Status",
        "Current Address",
        "Emergency Name",
        "Emergency Phone",
        "Asset",
        "Laptop"
    ]],

    body: selectedData.map(emp => [
        emp.employee_id,
        emp.first_name,
        emp.middle_name,
        emp.last_name,
        emp.gender,
        emp.phone_number,
        emp.official_email,
        emp.department_name,
        emp.work_location,
        emp.is_active ? "Active" : "Inactive",
        emp.extra?.current_address || "",
        emp.extra?.emergency_contact_name || "",
        emp.extra?.emergency_contact_number || "",
        emp.extra?.asset_id || "",
        emp.extra?.laptop_number || ""
    ]),

    theme: "grid",

    styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "middle",
    },

    headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
    },

    margin: 10,

    tableWidth: "auto",

    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0,
});
    doc.save("SelectedEmployees.pdf");

};

// ================= BULK DELETE =================

const bulkDelete = async () => {

    if (selectedEmployees.length === 0) {

        toast.error("Please select employees");

        return;

    }

    if (!window.confirm("Delete selected employees?"))

        return;

    try {

        for (const id of selectedEmployees) {

            await API.delete(`hr/employees/${id}/`);

        }

        toast.success("Employees deleted successfully");

        setSelectedEmployees([]);

        loadEmployees();

    }

    catch (err) {

        toast.error("Delete failed");

    }

};
  /* ================= EXPORT EXCEL ================= */
  const exportExcel = () => {
    const data = employees.map(e => ({

    // ===============================
    // BASIC INFORMATION
    // ===============================

    Employee_ID: e.employee_id,

    First_Name: e.first_name,

    Middle_Name: e.middle_name,

    Last_Name: e.last_name,

    Gender: e.gender,

    DOB: e.date_of_birth,

    Marital_Status: e.marital_status,

    Blood_Group: e.blood_group,

    Nationality: e.nationality,

    Father_Name: e.father_name,

    Mother_Name: e.mother_name,

    Phone_Number: e.phone_number,

    Official_Email: e.official_email,

    Personal_Email: e.personal_email,

    // ===============================
    // PROFESSIONAL
    // ===============================

    Department: e.department_name,

    Position: e.position,

    Employee_Type: e.employee_type,

    Employment_Type: e.employment_type,

    Reporting_Manager: e.reporting_manager,

    Joining_Date: e.joining_date,

    Work_Location: e.work_location,

    Salary: e.salary,

    Status: e.is_active ? "Active" : "Inactive",

    // ===============================
    // IDENTITY
    // ===============================

    PAN: e.pan,

    Aadhaar: e.aadhaar,

    UAN: e.uan,

    PF_Number: e.pf_number,

    // ===============================
    // BANK
    // ===============================

    Bank_Name: e.bank?.bank_name,

    Account_Holder: e.bank?.account_holder_name,

    Account_Number: e.bank?.account_number,

    IFSC_Code: e.bank?.ifsc_code,

    Branch_Name: e.bank?.branch_name,

    Account_Type: e.bank?.account_type,

    // ===============================
    // EXTRA
    // ===============================

    Current_Address: e.extra?.current_address,

    Permanent_Address: e.extra?.permanent_address,

    City: e.extra?.city,

    State: e.extra?.state,

    Country: e.extra?.country,

    Postal_Code: e.extra?.postal_code,

    Emergency_Name: e.extra?.emergency_contact_name,

    Emergency_Number: e.extra?.emergency_contact_number,

    Emergency_Relation: e.extra?.emergency_contact_relation,

    Skills: e.extra?.skills,

    Experience_Years: e.extra?.experience_years,

    Asset_ID: e.extra?.asset_id,

    Laptop_Number: e.extra?.laptop_number,

    Remarks: e.extra?.remarks

}));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "STPL-Master-table.xlsx");
  };
  // ================= SELECT EMPLOYEE =================

const toggleEmployee = (id) => {

    if (selectedEmployees.includes(id)) {

        setSelectedEmployees(
            selectedEmployees.filter(empId => empId !== id)
        );

    } else {

        setSelectedEmployees([
            ...selectedEmployees,
            id
        ]);

    }

};

  /* ================= PDF ================= */
  const exportPDF = (emp) => {
    const doc = new jsPDF();

    autoTable(doc, {
      body: Object.entries({
        Name: `${emp.first_name} ${emp.last_name}`,
        Position: emp.position,
        Department: emp.department_name,
        JoiningDate: emp.joining_date,
        Location: emp.location,
        OfficialEmail: emp.official_email,
        PersonalEmail: emp.personal_email,
        Salary: emp.salary,
        PAN: emp.pan,
        Aadhar: emp.aadhar,
        UAN: emp.uan,
        PF: emp.pf_number,
        Bank: emp.bank?.bank_name,
        Account: emp.bank?.account_number,
        IFSC: emp.bank?.ifsc_code,
        Address: emp.extra?.address,
        Asset: emp.extra?.asset_id
      })
    });

    doc.save(`${emp.name}.pdf`);
  };
  /* ================= IMPORT EXCEL ================= */
const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
        try {
            const workbook = XLSX.read(evt.target.result, {
                type: "binary",
            });

            const sheet =
                workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json(sheet, {
                defval: "",
            });

            if (rows.length === 0) {
                toast.error("Excel is empty.");
                return;
            }

            let success = 0;
            let failed = 0;

            for (const row of rows) {
                try {
                    const payload = {
                        first_name: row["First Name"],
                        middle_name: row["Middle Name"],
                        last_name: row["Last Name"],

                        gender: row["Gender"],
                        date_of_birth: row["Date of Birth"],

                        phone_number: String(
                            row["Phone Number"] || ""
                        ),

                        official_email: row["Official Email"],
                        personal_email: row["Personal Email"],

                        marital_status: row["Marital Status"],
                        blood_group: row["Blood Group"],
                        nationality: row["Nationality"],

                        father_name: row["Father Name"],
                        mother_name: row["Mother Name"],

                        position: row["Position"],

                        employee_type: row["Employee Type"],
                        employment_type: row["Employment Type"],

                        department: Number(
                            row["Department"]
                        ),

                        joining_date: row["Joining Date"],

                        work_location: row["Work Location"],

                        salary: Number(
                            row["Salary"] || 0
                        ),

                        pan: row["PAN"],

                        aadhaar: String(
                            row["Aadhaar"] || ""
                        ),

                        uan: String(
                            row["UAN"] || ""
                        ),

                        pf_number: row["PF Number"],

                        bank: {
                            bank_name: row["Bank Name"],
                            account_holder_name:
                                row["Account Holder Name"],

                            account_number: String(
                                row["Account Number"] || ""
                            ),

                            ifsc_code: row["IFSC"],

                            branch_name:
                                row["Branch Name"],

                            account_type:
                                row["Account Type"],
                        },

                        extra: {
                            current_address:
                                row["Current Address"],

                            permanent_address:
                                row["Permanent Address"],

                            city: row["City"],

                            state: row["State"],

                            country: row["Country"],

                            postal_code: String(
                                row["Postal Code"] || ""
                            ),

                            emergency_contact_name:
                                row[
                                    "Emergency Contact Name"
                                ],

                            emergency_contact_number:
                                String(
                                    row[
                                        "Emergency Contact Number"
                                    ] || ""
                                ),

                            emergency_contact_relation:
                                row[
                                    "Emergency Contact Relation"
                                ],

                            skills: row["Skills"],

                            experience_years:
                                Number(
                                    row[
                                        "Experience Years"
                                    ] || 0
                                ),

                            asset_id: row["Asset ID"],

                            laptop_number:
                                row["Laptop Number"],

                            remarks: row["Remarks"],
                        },
                    };

                    await API.post(
                        "hr/employees/",
                        payload
                    );

                    success++;
                } catch (err) {
                    console.error(
                        "Failed Row:",
                        row,
                        err.response?.data || err
                    );

                    failed++;
                }
            }

            toast.success(
                `${success} Employees Imported Successfully`
            );

            if (failed > 0) {
                toast.error(
                    `${failed} Employees Failed`
                );
            }

            loadEmployees();
        } catch (error) {
            console.error(error);
            toast.error("Invalid Excel File");
        }
    };

    reader.readAsBinaryString(file);
};
  /* ================= UI ================= */

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
    {/* ================= HEADER ================= */}

<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">

    <div className="flex justify-between items-center">

        <div>

            <h1 className="text-3xl font-bold text-gray-800">
                Employee Management
            </h1>

            <p className="text-gray-500 mt-2">
                Manage employees, departments, documents and payroll information.
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

                <input
                    hidden
                    type="file"
                    onChange={importExcel}
                />

            </label>

        </div>

    </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

<div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">

    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        👨‍💼 Total Employees
    </h3>

    <h2 className="text-4xl font-bold text-gray-800 mt-2">
        {employees.length}
    </h2>

</div>

  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">

    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        🟢 Active Employees
    </h3>

    <h2 className="text-4xl font-bold text-green-600 mt-2">
        {employees.filter(e => e.is_active).length}
    </h2>

</div>
  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">

    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        🏢 Departments
    </h3>

    <h2 className="text-4xl font-bold text-purple-600 mt-2">
        {departments.length}
    </h2>

</div>
  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-600 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">

    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        🔴 Inactive Employees
    </h3>

    <h2 className="text-4xl font-bold text-red-600 mt-2">
        {employees.filter(e => !e.is_active).length}
    </h2>

</div>
</div>

      {/* SEARCH */}
      {/* ================= SEARCH BAR ================= */}

<div className="bg-white rounded-xl shadow p-4 mb-6">

<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

<input
type="text"
placeholder="🔍 Search Name / Employee ID / Position"
value={search}
onChange={(e)=>{
    setSearch(e.target.value);
    setCurrentPage(1);
}}
className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
/>

<select
value={departmentFilter}
onChange={(e)=>{
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
}}
className="border rounded-lg p-3"
>

<option value="">All Departments</option>

{departments.map(dep=>(
<option
key={dep.id}
value={dep.id}
>
{dep.name}
</option>
))}

</select>

<select
value={statusFilter}
onChange={(e)=>{
    setStatusFilter(e.target.value);
    setCurrentPage(1);
}}
className="border border-gray-300 rounded-xl px-4 py-3"
>

<option value="">All Status</option>
<option value="Active">Active</option>
<option value="Inactive">Inactive</option>

</select>
<button
onClick={()=>{
setSearch("");
setDepartmentFilter("");
setStatusFilter("");
setCurrentPage(1);
}}
className="bg-gray-200 rounded-lg hover:bg-gray-100">
  <b>
Clear Filters</b>
</button>
</div>
{selectedEmployees.length > 0 && (

<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex justify-between items-center">

<div className="font-semibold text-blue-700">

{selectedEmployees.length} Employee(s) Selected

</div>

<div className="flex gap-3">

<button
onClick={bulkExportExcel}
className="bg-green-600 text-white px-4 py-2 rounded-lg"
>
📊 Export Excel
</button>

<button
onClick={bulkExportPDF}
className="bg-red-600 text-white px-4 py-2 rounded-lg"
>
📄 Export PDF
</button>

<button
onClick={bulkDelete}
className="bg-gray-700 text-white px-4 py-2 rounded-lg"
>
🗑 Delete
</button>

<button
onClick={() => setSelectedEmployees([])}
className="bg-gray-300 px-4 py-2 rounded-lg"
>
❌ Clear
</button>

</div>

</div>

)}

</div>


    
      {/* EMPLOYEE TABLE */}
<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-dark">
            <tr className="bg-gray-200">
              
    <th className="px-5 py-4 text-center">
      Select
      </th>       
    <th className="px-5 py-4 text-left">
      
      Photo</th>

<th
onClick={() => handleSort("employee_id")}
className="px-5 py-4 text-left cursor-pointer hover:bg-gray-300 select-none"
>
Employee ID

{sortField === "employee_id" &&
(sortOrder === "asc" ? " ▲" : " ▼")}

</th>

<th
onClick={() => handleSort("first_name")}
className="px-5 py-4 text-left cursor-pointer hover:bg-gray-300 select-none"
>
Employee Name

{sortField === "first_name" &&
(sortOrder === "asc" ? " ▲" : " ▼")}

</th>
<th
onClick={() => handleSort("department_name")}
className="px-5 py-4 text-left cursor-pointer hover:bg-gray-300 select-none"
>
Department

{sortField === "department_name" &&
(sortOrder === "asc" ? " ▲" : " ▼")}

</th>
<th
onClick={() => handleSort("position")}
className="px-5 py-4 text-left cursor-pointer hover:bg-gray-300 select-none"
>
Designation

{sortField === "position" &&
(sortOrder === "asc" ? " ▲" : " ▼")}

</th>

<th className="px-5 py-4 text-left">
Official Email
</th>

<th className="px-5 py-4 text-left">
Phone
</th>
<th
onClick={() => handleSort("is_active")}
className="px-5 py-4 text-center cursor-pointer hover:bg-gray-300 select-none"
>
Status

{sortField === "is_active" &&
(sortOrder === "asc" ? " ▲" : " ▼")}

</th>

<th className="px-5 py-4 text-center">
Actions
</th>

</tr>
          </thead>

          <tbody>
          {
loading && (

<tr>

<td
colSpan="9"
className="text-center py-10"
>

<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>

<p className="mt-3 text-gray-500">

Loading Employees...

</p>

</td>

</tr>

)
}
{
!loading && currentRecords.length === 0 && (

<tr>

<td
colSpan="9"
className="py-16 text-center"
>

<div className="flex flex-col items-center">

<div className="text-6xl mb-4">
📂
</div>

<h2 className="text-2xl font-bold text-gray-700">
No Employees Found
</h2>

<p className="text-gray-500 mt-2">
No employee matches your current search or filters.
</p>

<button
onClick={openAdd}
className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
>
➕ Add Employee
</button>

</div>

</td>

</tr>

)
}
         {currentRecords.map(emp => (
              <tr
key={emp.id}
className="border-b hover:bg-blue-50 transition"
>
<td className="text-center">

<input
type="checkbox"
checked={selectedEmployees.includes(emp.id)}
onChange={() => toggleEmployee(emp.id)}
/>

</td>
  

<td className="px-5 py-3">

<img

src={
emp.profile_picture ||
"https://ui-avatars.com/api/?name=" +
(emp.first_name || "Employee")
}

alt="employee"

className="w-12 h-12 rounded-full object-cover border"

/>

</td>

<td className="px-5">

{emp.employee_id}

</td>

<td className="px-5">

<div>

<p className="font-semibold">

{emp.first_name} {emp.last_name}

</p>

<p className="text-xs text-gray-500">

{emp.employee_type}

</p>

</div>

</td>

<td className="px-5">

{emp.department_name}

</td>

<td className="px-5">

{emp.position}

</td>

<td className="px-5">

{emp.official_email}

</td>

<td className="px-5">

{emp.phone_number}

</td>

<td className="px-5 text-center">

<span
className={`px-3 py-1 rounded-full text-xs font-semibold ${
emp.is_active
? "bg-green-100 text-green-700"
: "bg-red-100 text-red-700"
}`}
>

{emp.is_active ? "Active" : "Inactive"}

</span>

</td>

<td className="px-5">

<div className="flex justify-center gap-2">

<button
onClick={()=>openView(emp)}
className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
>
👁
</button>

<button
onClick={()=>openEdit(emp)}
className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg"
>
✏
</button>

<button
onClick={()=>deleteEmp(emp.id)}
className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
>
🗑
</button>

<button
onClick={()=>exportPDF(emp)}
className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
>
📄
</button>

</div>

</td>

</tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center p-4 border-t">

<div>

Showing

<b>
{" "}
{indexOfFirstRecord + 1}
</b>

-

<b>
{" "}
{Math.min(indexOfLastRecord, filtered.length)}
</b>

of

<b>
{" "}
{filtered.length}
</b>

Employees

</div>

<div className="flex gap-2">

<button

disabled={currentPage===1}

onClick={()=>setCurrentPage(currentPage-1)}

className={`px-4 py-2 rounded ${
currentPage===1
?"bg-gray-200 cursor-not-allowed"
:"bg-blue-600 text-white"
}`}
>

Previous

</button>

<span className="px-4 py-2">

Page {currentPage} of {totalPages}

</span>

<button

disabled={currentPage===totalPages}

onClick={()=>setCurrentPage(currentPage+1)}

className={`px-4 py-2 rounded ${
currentPage===totalPages
?"bg-gray-200 cursor-not-allowed"
:"bg-blue-600 text-white"
}`}
>

Next

</button>

</div>

</div>
      </div>

      {/* MODAL */}
{modal && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

    <div className="bg-white rounded-2xl w-[1300px] max-w-[95vw] h-[90vh] shadow-2xl flex flex-col">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-8 py-6 rounded-t-2xl">

        <h2 className="text-3xl font-bold tracking-wide">
          {modal === "add"
            ? "Add Employee"
            : modal === "edit"
            ? "Update Employee"
            : "Employee Details"}
        </h2>

        <p className="text-blue-100 mt-1">
          STPL Human Resource Management
        </p>

      </div>

      {/* TABS */}
      <div className="px-6 py-4 border-b bg-gray-50">

        <div className="grid grid-cols-7 gap-2">

          {[
            "Personal",
            "Professional",
            "Contact",
            "Identity",
            "Bank",
            "Extra",
            "Documents"
          ].map((s, i) => (

            <button
              key={i}
              onClick={() => setStep(i)}
              className={`py-3 rounded-xl font-semibold transition-all duration-300
              ${
                step === i
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white border hover:bg-blue-50"
              }`}
            >
              {s}
            </button>

          ))}

        </div>

      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        



            {/* FORM */}
            <div className="px-8 py-6 bg-slate-50">
    
  
  {step === 0 && (
                  

<div className="grid grid-cols-12 gap-8">

  {/* Left Side */}
  <div className="col-span-9">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      <div className="form-group">
        <label className="form-label">First Name</label>
        <input
          className="input"
          value={form.first_name}
          onChange={(e)=>
            setForm({
              ...form,
              first_name:e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Middle Name</label>
        <input
          className="input"
          value={form.middle_name}
          onChange={(e)=>
            setForm({
              ...form,
              middle_name:e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Last Name</label>
        <input
          className="input"
          value={form.last_name}
          onChange={(e)=>
            setForm({
              ...form,
              last_name:e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Gender</label>

        <select
          className="input"
          value={form.gender}
          onChange={(e)=>
            setForm({
              ...form,
              gender:e.target.value
            })
          }
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Date of Birth</label>

        <input
          type="date"
          className="input"
          value={form.date_of_birth}
          onChange={(e)=>
            setForm({
              ...form,
              date_of_birth:e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Marital Status</label>

        <select
          className="input"
          value={form.marital_status}
          onChange={(e)=>
            setForm({
              ...form,
              marital_status:e.target.value
            })
          }
        >
          <option value="">Select</option>
          <option>Single</option>
          <option>Married</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Blood Group</label>

        <input
          className="input"
          value={form.blood_group}
          onChange={(e)=>
            setForm({
              ...form,
              blood_group:e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Nationality</label>

        <input
          className="input"
          value={form.nationality}
          onChange={(e)=>
            setForm({
              ...form,
              nationality:e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Father Name</label>

        <input
          className="input"
          value={form.father_name}
          onChange={(e)=>
            setForm({
              ...form,
              father_name:e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Mother Name</label>

        <input
          className="input"
          value={form.mother_name}
          onChange={(e)=>
            setForm({
              ...form,
              mother_name:e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number</label>

        <input
          className="input"
          value={form.phone_number}
          onChange={(e)=>
            setForm({
              ...form,
              phone_number:e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Personal Email</label>

        <input
          className="input"
          value={form.personal_email}
          onChange={(e)=>
            setForm({
              ...form,
              personal_email:e.target.value
            })
          }
        />
      </div>

    </div>

  </div>

  {/* Right Side */}
  <div className="col-span-3">

    <div className="sticky top-4 bg-white rounded-2xl border border-slate-200 shadow-md p-6">
          <h3 className="text-xl font-bold text-center">
Employee Profile
</h3>

<p className="text-sm text-gray-500 text-center mb-6">
Photo & Summary
</p>

      <div className="flex flex-col items-center">
    
        {form.profile_picture || form.profile_picture_preview ? (
          
          <img
            src={
              form.profile_picture
                ? URL.createObjectURL(form.profile_picture)
                : form.profile_picture_preview
            }
            alt="Profile"
            className="w-44 h-44 rounded-full object-cover border-4 border-blue-500 shadow"
          />

        ) : (

          <div className="w-44 h-44 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">

            No Photo

          </div>

        )}

        <input
          type="file"
          accept="image/*"
          className="mt-5 w-full"
          onChange={(e)=>
            setForm({
              ...form,
              profile_picture:e.target.files[0]
            })
          }
        />

      </div>

    </div>

  </div>

</div>

)}

              {step===1 && (

<div className="grid grid-cols-2 gap-5">

  <input
    className="input"
    placeholder="Position"
    value={form.position}
    onChange={(e)=>setForm({...form,position:e.target.value})}
  />
 <div className="form-group">
  <label className="form-label">
    Employee Type
  </label>

  <select
    className="input"
    value={form.employee_type}
    onChange={(e) =>
      setForm({
        ...form,
        employee_type: e.target.value
      })
    }
  >
    <option value="">Select Employee Type</option>
    <option value="Permanent">Permanent</option>
    <option value="Probation">Probation</option>
    <option value="Intern">Intern</option>
    <option value="Consultant">Consultant</option>
    <option value="Contract">Contract</option>
  </select>
</div>
 <select
    className="input"
    value={form.employment_type}
    onChange={(e)=>setForm({...form,employment_type:e.target.value})}
  >
    <option value="">Employment Type</option>
<option value="Full Time">Full Time</option>
<option value="Intern">Intern</option>
<option value="Contract">Contract</option>
<option value="Part Time">Part Time</option>
  </select>

  <input
    type="date"
    className="input"
    value={form.joining_date}
    onChange={(e)=>setForm({...form,joining_date:e.target.value})}
  />

  <select
    className="input"
    value={form.department}
    onChange={(e)=>setForm({...form,department:e.target.value})}
  >
    <option value="">Department</option>

    {departments.map(d=>(
      <option key={d.id} value={d.id}>
        {d.name}
      </option>
    ))}
  </select>

  <select
    value={form.reporting_manager || ""}
    onChange={(e)=>
        setForm({
            ...form,
            reporting_manager:e.target.value
        })
    }
>
    <option value="">Select Manager</option>

    {employees.map(emp=>(
        <option
            key={emp.id}
            value={emp.id}
        >
            {emp.full_name}
        </option>
    ))}
</select>
  <input
    className="input"
    placeholder="Location"
    value={form.work_location}
    onChange={(e)=>setForm({...form,work_location:e.target.value})}
  />

  <input
    className="input"
    placeholder="Salary"
    value={form.salary}
    onChange={(e)=>setForm({...form,salary:e.target.value})}
  />

  
</div>

)}

              {step===2 && (

<div className="grid grid-cols-2 gap-5">

  <div className="form-group">
    <label className="form-label">Official Email</label>

    <input
      className="input"
      value={form.official_email}
      onChange={(e)=>setForm({...form,official_email:e.target.value})}
    />
  </div>

  <div className="form-group">
    <label className="form-label">Emergency Contact Name</label>

    <input
      className="input"
      value={form.extra.emergency_contact_name}
      onChange={(e)=>setForm({
    ...form,
    extra:{
        ...form.extra,
        emergency_contact_name:e.target.value
    }
})}
    />
  </div>

  <div className="form-group">
    <label className="form-label">Emergency Contact Number</label>

    <input
      className="input"
      value={form.extra.emergency_contact_number}
      onChange={(e)=>setForm({
    ...form,
    extra:{
        ...form.extra,
        emergency_contact_number:e.target.value
    }
})}
    />
  </div>

  <div className="form-group col-span-2">
    <label className="form-label">Current Address</label>

    <textarea
      rows="3"
      className="input"
      value={form.extra.current_address}
      onChange={(e)=>setForm({
    ...form,
    extra:{
        ...form.extra,
        current_address:e.target.value
    }
})}

    />
  </div>
<div className="form-group col-span-2">

<label className="form-label">
Permanent Address
</label>

<textarea

rows="3"

className="input"

value={form.extra.permanent_address}

onChange={(e)=>
setForm({
...form,
extra:{
...form.extra,
permanent_address:e.target.value
}
})
}

/>

</div>
<input

className="input"

placeholder="City"

value={form.extra.city}

onChange={(e)=>
setForm({
...form,
extra:{
...form.extra,
city:e.target.value
}
})
}

/>
<input

className="input"

placeholder="State"

value={form.extra.state}

onChange={(e)=>
setForm({
...form,
extra:{
...form.extra,
state:e.target.value
}
})
}

/>

<input

className="input"

placeholder="Country"

value={form.extra.country}

onChange={(e)=>
setForm({
...form,
extra:{
...form.extra,
country:e.target.value
}
})
}

/>
<input

className="input"

placeholder="Postal Code"

value={form.extra.postal_code}

onChange={(e)=>
setForm({
...form,
extra:{
...form.extra,
postal_code:e.target.value
}
})
}

/>  
</div>

)}
{step===3 && (

<div className="grid grid-cols-2 gap-5">

  <div className="form-group">
    <label className="form-label">PAN Number</label>

    <input
      className="input"
      value={form.pan}
      onChange={(e)=>setForm({...form,pan:e.target.value})}
    />
  </div>

  <div className="form-group">
    <label className="form-label">Aadhaar Number</label>

    <input
      className="input"
      value={form.aadhaar}
      onChange={(e)=>setForm({...form,aadhaar:e.target.value})}
    />
  </div>

  <div className="form-group">
    <label className="form-label">UAN Number</label>

    <input
      className="input"
      value={form.uan}
      onChange={(e)=>setForm({...form,uan:e.target.value})}
    />
  </div>

  <div className="form-group">
    <label className="form-label">PF Number</label>

    <input
      className="input"
      value={form.pf_number}
      onChange={(e)=>setForm({...form,pf_number:e.target.value})}
    />
  </div>

</div>

)}

              {step===4 && (
<div className="grid grid-cols-2 gap-5">

  <div className="form-group">
    <label className="form-label">Bank Name</label>
    <input
      className="input"
      value={form.bank.bank_name}
      onChange={e=>setForm({
        ...form,
        bank:{
          ...form.bank,
          bank_name:e.target.value
        }
      })}
    />
  </div>

  <div className="form-group">
    <label className="form-label">Account Number</label>
    <input
      className="input"
      value={form.bank.account_number}
      onChange={e=>setForm({
        ...form,
        bank:{
          ...form.bank,
          account_number:e.target.value
        }
      })}
    />
  </div>

  <div className="form-group col-span-2">
    <label className="form-label">IFSC Code</label>
    <input
      className="input"
      value={form.bank.ifsc_code}
      onChange={e=>setForm({
        ...form,
        bank:{
          ...form.bank,
          ifsc_code:e.target.value
        }
      })}
    />
  </div>
  <div className="form-group">
  <label className="form-label">Branch Name</label>

  <input
    className="input"
    value={form.bank.branch_name}
    onChange={(e)=>setForm({
      ...form,
      bank:{
        ...form.bank,
        branch_name:e.target.value
      }
    })}
  />
</div>

<div className="form-group">
  <label className="form-label">Account Holder Name</label>

  <input
    className="input"
    value={form.bank.account_holder_name}
    onChange={(e)=>setForm({
      ...form,
      bank:{
        ...form.bank,
        account_holder_name:e.target.value
      }
    })}
  />
</div>
<input

className="input"

placeholder="Account Type"

value={form.bank.account_type}

onChange={(e)=>
setForm({
...form,
bank:{
...form.bank,
account_type:e.target.value
}
})
}

/>

</div>
)}
              {step===5 && (

<div className="grid grid-cols-2 gap-5">

  <div className="form-group">
    <label>Current Address</label>

    <textarea
      className="input"
      value={form.extra.current_address}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            current_address:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Permanent Address</label>

    <textarea
      className="input"
      value={form.extra.permanent_address}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            permanent_address:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>City</label>

    <input
      className="input"
      value={form.extra.city}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            city:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>State</label>

    <input
      className="input"
      value={form.extra.state}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            state:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Country</label>

    <input
      className="input"
      value={form.extra.country}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            country:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Postal Code</label>

    <input
      className="input"
      value={form.extra.postal_code}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            postal_code:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Emergency Contact Name</label>

    <input
      className="input"
      value={form.extra.emergency_contact_name}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            emergency_contact_name:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Emergency Contact Number</label>

    <input
      className="input"
      value={form.extra.emergency_contact_number}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            emergency_contact_number:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Relation</label>

    <input
      className="input"
      value={form.extra.emergency_contact_relation}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            emergency_contact_relation:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Skills</label>

    <input
      className="input"
      value={form.extra.skills}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            skills:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Experience (Years)</label>

    <input
      type="number"
      className="input"
      value={form.extra.experience_years}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            experience_years:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Asset ID</label>

    <input
      className="input"
      value={form.extra.asset_id}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            asset_id:e.target.value
          }
        })
      }
    />
  </div>

  <div className="form-group">
    <label>Laptop Number</label>

    <input
      className="input"
      value={form.extra.laptop_number}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            laptop_number:e.target.value
          }
        })
      }
    />
  </div>

  <div className="col-span-2">
    <label>Remarks</label>

    <textarea
      className="input"
      value={form.extra.remarks}
      onChange={(e)=>
        setForm({
          ...form,
          extra:{
            ...form.extra,
            remarks:e.target.value
          }
        })
      }
    />
  </div>

</div>

)}
{step === 6 && (

<div className="grid grid-cols-2 gap-6">

  {/* ================= Resume ================= */}
  <div className="border rounded-xl p-4 shadow bg-white">

    <h4 className="font-semibold mb-2">📄 Resume</h4>

    {form.documents.resume_preview && (
      <>
        <p className="text-sm text-gray-600 mb-3">
          {form.documents.resume_preview.split("/").pop()}
        </p>

        <div className="flex gap-2 mb-3">

          <a
            href={form.documents.resume_preview}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            👁 Preview
          </a>

          <a
            href={form.documents.resume_preview}
            download
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            ⬇ Download
          </a>

        </div>
      </>
    )}

    <input
      type="file"
      className="input"
      onChange={(e)=>
        setForm({
          ...form,
          documents:{
            ...form.documents,
            resume:e.target.files[0]
          }
        })
      }
    />

  </div>

  {/* ================= Offer Letter ================= */}

  <div className="border rounded-xl p-4 shadow bg-white">

    <h4 className="font-semibold mb-2">📄 Offer Letter</h4>

    {form.documents.offer_letter_preview && (
      <>
        <p className="text-sm text-gray-600 mb-3">
          {form.documents.offer_letter_preview.split("/").pop()}
        </p>

        <div className="flex gap-2 mb-3">

          <a
            href={form.documents.offer_letter_preview}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            👁 Preview
          </a>

          <a
            href={form.documents.offer_letter_preview}
            download
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            ⬇ Download
          </a>

        </div>
      </>
    )}

    <input
      type="file"
      className="input"
      onChange={(e)=>
        setForm({
          ...form,
          documents:{
            ...form.documents,
            offer_letter:e.target.files[0]
          }
        })
      }
    />

  </div>

  {/* ================= PAN ================= */}

  <div className="border rounded-xl p-4 shadow bg-white">

    <h4 className="font-semibold mb-2">🪪 PAN Attachment</h4>

    {form.documents.pan_document_preview && (
      <>
        <p className="text-sm text-gray-600 mb-3">
          {form.documents.pan_document_preview.split("/").pop()}
        </p>

        <div className="flex gap-2 mb-3">

          <a
            href={form.documents.pan_document_preview}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            👁 Preview
          </a>

          <a
            href={form.documents.pan_document_preview}
            download
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            ⬇ Download
          </a>

        </div>
      </>
    )}

    <input
      type="file"
      className="input"
      onChange={(e)=>
        setForm({
          ...form,
          documents:{
            ...form.documents,
            pan_document:e.target.files[0]
          }
        })
      }
    />

  </div>

  {/* ================= Aadhaar ================= */}

  <div className="border rounded-xl p-4 shadow bg-white">

    <h4 className="font-semibold mb-2">🪪 Aadhaar Attachment</h4>

    {form.documents.aadhaar_document_preview && (
      <>
        <p className="text-sm text-gray-600 mb-3">
          {form.documents.aadhaar_document_preview.split("/").pop()}
        </p>

        <div className="flex gap-2 mb-3">

          <a
            href={form.documents.aadhaar_document_preview}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            👁 Preview
          </a>

          <a
            href={form.documents.aadhaar_document_preview}
            download
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            ⬇ Download
          </a>

        </div>
      </>
    )}

    <input
      type="file"
      className="input"
      onChange={(e)=>
        setForm({
          ...form,
          documents:{
            ...form.documents,
            aadhaar_document:e.target.files[0]
          }
        })
      }
    />

  </div>

  {/* ================= Experience ================= */}

  <div className="border rounded-xl p-4 shadow bg-white">

    <h4 className="font-semibold mb-2">📜 Experience Certificate</h4>

    {form.documents.experience_certificate_preview && (
      <>
        <p className="text-sm text-gray-600 mb-3">
          {form.documents.experience_certificate_preview.split("/").pop()}
        </p>

        <div className="flex gap-2 mb-3">

          <a
            href={form.documents.experience_certificate_preview}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            👁 Preview
          </a>

          <a
            href={form.documents.experience_certificate_preview}
            download
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            ⬇ Download
          </a>

        </div>
      </>
    )}

    <input
      type="file"
      className="input"
      onChange={(e)=>
        setForm({
          ...form,
          documents:{
            ...form.documents,
            experience_certificate:e.target.files[0]
          }
        })
      }
    />

  </div>

  {/* ================= Other ================= */}

  <div className="border rounded-xl p-4 shadow bg-white">

    <h4 className="font-semibold mb-2">📁 Other Document</h4>

    {form.documents.other_document_preview && (
      <>
        <p className="text-sm text-gray-600 mb-3">
          {form.documents.other_document_preview.split("/").pop()}
        </p>

        <div className="flex gap-2 mb-3">

          <a
            href={form.documents.other_document_preview}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            👁 Preview
          </a>

          <a
            href={form.documents.other_document_preview}
            download
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            ⬇ Download
          </a>

        </div>
      </>
    )}

    <input
      type="file"
      className="input"
      onChange={(e)=>
        setForm({
          ...form,
          documents:{
            ...form.documents,
            other_document:e.target.files[0]
          }
        })
      }
    />

  </div>

</div>

)}
{step>0 && (
<button
onClick={()=>setStep(step-1)}
className="px-6 py-2 bg-gray-200 rounded-lg"
>
Previous
</button>
)}

</div>

<div className="flex gap-3">

<button
onClick={()=>setModal(null)}
className="px-6 py-2 bg-red-500 text-white rounded-lg"
>
Cancel
</button>

{step<6 && modal!=="view" && (
<button
onClick={()=>setStep(step+1)}
className="px-6 py-2 bg-blue-600 text-white rounded-lg"
>
Next
</button>
)}

{step===6 && modal!=="view" && (
<button
onClick={save}
className="px-6 py-2 bg-green-600 text-white rounded-lg"
>
Save Employee
</button>
)}

</div>

</div>

          </div>
        </div>
      )}
    </div>
  );
}