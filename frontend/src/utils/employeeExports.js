import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((emp) => ({
      ID: emp.employee_id,
      Name: `${emp.first_name} ${emp.last_name}`,
      Email: emp.official_email,
      Designation: emp.position,
      Status: emp.is_active ? "Active" : "Inactive",
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
  XLSX.writeFile(workbook, "Employee_Directory.xlsx");
};

export const exportPDF = (data) => {
  const doc = new jsPDF();
  doc.text("Employee Directory", 14, 15);
  
  const tableColumn = ["ID", "Name", "Email", "Position", "Status"];
  const tableRows = data.map((emp) => [
    emp.employee_id,
    `${emp.first_name} ${emp.last_name}`,
    emp.official_email,
    emp.position,
    emp.is_active ? "Active" : "Inactive",
  ]);

  doc.autoTable({
    startY: 20,
    head: [tableColumn],
    body: tableRows,
  });

  doc.save("Employee_Directory.pdf");
};