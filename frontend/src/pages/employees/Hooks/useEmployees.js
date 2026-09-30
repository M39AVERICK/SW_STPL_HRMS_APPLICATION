import { useState, useEffect, useMemo } from "react";
import API from "../../api";

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const recordsPerPage = 10;

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get("hr/employees/");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await API.get("hr/departments/");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error loading departments:", err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, departmentFilter, statusFilter]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
      const matchSearch =
        fullName.includes(search.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
        emp.position?.toLowerCase().includes(search.toLowerCase()) ||
        emp.official_email?.toLowerCase().includes(search.toLowerCase());

      const matchDept = !departmentFilter || emp.department === Number(departmentFilter);
      const matchStatus =
        statusFilter === ""
          ? true
          : statusFilter === "Active"
          ? emp.is_active
          : !emp.is_active;

      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      if (!sortField) return 0;
      let valA = (a[sortField] ?? "").toString().toLowerCase();
      let valB = (b[sortField] ?? "").toString().toLowerCase();
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [filteredEmployees, sortField, sortOrder]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return sortedEmployees.slice(start, start + recordsPerPage);
  }, [sortedEmployees, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedEmployees(paginatedEmployees.map((e) => e.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const toggleSelectEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return {
    employees,
    departments,
    loading,
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    sortField,
    sortOrder,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil(filteredEmployees.length / recordsPerPage),
    paginatedEmployees,
    totalRecords: filteredEmployees.length,
    selectedEmployees,
    setSelectedEmployees,
    toggleSelectAll,
    toggleSelectEmployee,
    loadEmployees,
  };
}