import React, { useEffect, useState, useCallback, useMemo } from "react";
import API from "../../api";
import { toast } from "react-toastify";

// Imported Components
import EmployeeStats from "./EmployeeStats";
import EmployeeFilters from "./EmployeeFilters";
import BulkActionBar from "./BulkActionsBar";
import EmployeeTable from "./EmployeeTable";
import EmployeePagination from "./EmployeePagination";
import EmployeeModal from "./EmployeeModal/ModalContainer";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sorting & Pagination
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Selection & Modal
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'view' | null
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Fetching Data (Memoized with useCallback)
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("hr/employees/");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await API.get("hr/departments/");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [loadEmployees, loadDepartments]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, departmentFilter, statusFilter]);

  // ================= MEMOIZED COMPUTATIONS =================
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
      const searchLower = search.toLowerCase();

      const searchMatch =
        fullName.includes(searchLower) ||
        emp.employee_id?.toLowerCase().includes(searchLower) ||
        emp.position?.toLowerCase().includes(searchLower) ||
        emp.official_email?.toLowerCase().includes(searchLower);

      const departmentMatch =
        !departmentFilter || emp.department === Number(departmentFilter);

      const statusMatch =
        statusFilter === ""
          ? true
          : statusFilter === "Active"
          ? emp.is_active
          : !emp.is_active;

      return searchMatch && departmentMatch && statusMatch;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const sortedEmployees = useMemo(() => {
    if (!sortField) return filteredEmployees;

    return [...filteredEmployees].sort((a, b) => {
      let valA = a[sortField] ?? "";
      let valB = b[sortField] ?? "";

      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();

      if (sortOrder === "asc") return valA.localeCompare(valB);
      return valB.localeCompare(valA);
    });
  }, [filteredEmployees, sortField, sortOrder]);

  const currentRecords = useMemo(() => {
    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    return sortedEmployees.slice(indexOfFirst, indexOfLast);
  }, [sortedEmployees, currentPage, recordsPerPage]);

  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);

  // ================= MEMOIZED ACTION HANDLERS =================
  const handleSort = useCallback((field) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortOrder("asc");
      return field;
    });
  }, []);

  const toggleSelectEmployee = useCallback((id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete employee?")) return;
    try {
      await API.delete(`hr/employees/${id}/`);
      toast.success("Employee deleted successfully");
      loadEmployees();
    } catch (err) {
      toast.error("Delete failed");
    }
  }, [loadEmployees]);

  const handleOpenModal = useCallback((type, emp = null) => {
    setSelectedEmp(emp);
    setModal(type);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModal(null);
    setSelectedEmp(null);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header & Main Stats */}
      <EmployeeStats
        employees={employees}
        departments={departments}
        onAddClick={() => handleOpenModal("add")}
        onRefresh={loadEmployees}
      />

      {/* Filter Controls */}
      <EmployeeFilters
        search={search}
        setSearch={setSearch}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departments={departments}
      />

      {/* Bulk Action Bar */}
      {selectedEmployees.length > 0 && (
        <BulkActionBar
          selectedEmployees={selectedEmployees}
          employees={employees}
          setSelectedEmployees={setSelectedEmployees}
          loadEmployees={loadEmployees}
        />
      )}

      {/* Optimized Data Table */}
      <EmployeeTable
        records={currentRecords}
        loading={loading}
        selectedEmployees={selectedEmployees}
        toggleSelectEmployee={toggleSelectEmployee}
        handleSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
        onView={(emp) => handleOpenModal("view", emp)}
        onEdit={(emp) => handleOpenModal("edit", emp)}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <EmployeePagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalRecords={filteredEmployees.length}
        indexOfFirstRecord={(currentPage - 1) * recordsPerPage}
        indexOfLastRecord={currentPage * recordsPerPage}
      />

      {/* Multi-Step Modal Component */}
      {modal && (
        <EmployeeModal
          modal={modal}
          employee={selectedEmp}
          departments={departments}
          employees={employees}
          onClose={handleCloseModal}
          onSuccess={loadEmployees}
        />
      )}
    </div>
  );
}