# HRMS Portal

A modern Human Resource Management System (HRMS) built using Django REST Framework and React. The application provides secure employee management, role-based access control, document management, and an interactive dashboard.

---

## Features

### Authentication

- JWT Authentication
- Secure Login
- Role-Based Access Control

### User Roles

- Super Admin
- Admin
- HR
- Viewer
- Employee

### Employee Management

- Create Employee
- Update Employee
- Delete Employee
- View Employee Details
- Search Employees
- Filter Employees

### Employee Information

- Personal Details
- Professional Details
- Bank Details
- Emergency Contact
- Extra Details
- Identity Information
- Asset Details

### Document Management

- Resume Upload
- PAN Upload
- Aadhaar Upload
- Offer Letter Upload
- Employee Documents

### Dashboard

- Employee Growth Graph
- Department Statistics
- Employee Distribution
- Interactive Charts

### Security

- JWT Authentication
- Protected APIs
- Role Permissions
- Input Validation

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- Chart.js

### Backend

- Django
- Django REST Framework
- PostgreSQL

### Tools

- Git
- GitHub
- Postman

---

## Project Structure

```
HRMS
│
├── backend
│   ├── accounts
│   ├── HR_APP
│   ├── media
│   ├── manage.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/hrms.git
```

Move into the project.

```bash
cd hrms
```

---

### Backend Setup

```bash
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Install packages

```bash
pip install -r requirements.txt
```

Run migrations

```bash
python manage.py migrate
```

Start server

```bash
python manage.py runserver
```

---

### Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run

```bash
npm run dev
```

---

## API Authentication

JWT Authentication is used.

Example endpoints

```
POST /api/login/
POST /api/token/refresh/
GET /api/hr/employees/
POST /api/hr/employees/
```

---

## Future Enhancements

- Payroll Module
- Attendance Management
- Leave Management
- Recruitment Module
- Performance Management
- Notifications
- Email Integration
- Reports & Analytics

---

## Author

Sahil Wadhwa

Software Developer
