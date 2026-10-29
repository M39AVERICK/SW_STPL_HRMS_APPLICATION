# HRMS Portal

A role-based Human Resource Management System built with Django REST Framework and React. It supports employee records and documents, attendance, weekly timesheets, approval workflows, and payroll record keeping.

## Features

- **Accounts and access:** JWT sign-in, protected APIs, and role-based access for Admin, HR, Approver, Finance, and Viewer (employee) accounts.
- **Employee management:** Create, view, update, search, filter, import, and export employee records. Employee records include personal, professional, bank, identity, emergency contact, and asset information.
- **Employee self-service:** View account and employee details, review HR-held documents, update a profile photo, view attendance, and submit weekly timesheets.
- **Document management:** HR can manage employee documents such as resumes, PAN and Aadhaar documents, offer letters, experience certificates, and other files. Employee document downloads are authenticated.
- **Attendance:** Attendance records, shifts, on-site attendance, and notifications.
- **Timesheets:** Employees record daily regular and extra hours and attach a weekly PDF. Assigned approvers review and approve or request changes. Approved timesheets go to Finance for processing.
- **Finance and payroll records:** Finance records processing and an optional reference. HR/Admin can review approval and Finance history, then record weekly payroll days and hours for internal records.
- **Dashboards:** Employee and department summaries with interactive charts.
- **Project setup:** HR/Admin can manage clients, projects, employee assignments, and approvers.

## Roles

| Role | Main access |
| --- | --- |
| Admin | HR administration, employee and project setup, approvals oversight, and payroll records |
| HR | Employee and project administration, approvals oversight, and payroll records |
| Approver | Review timesheets for employees assigned to them |
| Finance | Process approver-approved timesheets |
| Viewer | Employee self-service, including their own profile, attendance, and timesheets |

## Technology

- **Frontend:** React 19, Vite, React Router, Tailwind CSS, Axios, Chart.js, Recharts
- **Backend:** Django 6, Django REST Framework, Simple JWT
- **Database:** SQLite by default. Configure a different Django database backend in `config/settings/base.py` if needed.
- **File handling:** Django media storage for employee and timesheet documents

## Repository layout

```text
resume_project/
├── ACCOUNTS/          # Authentication, profiles, and account roles
├── Attendance/        # Attendance and shift APIs
├── HR_APP/            # Employees, departments, and employee documents
├── Timesheet/         # Projects, assignments, timesheets, approvals, Finance
├── po_app/            # Purchase order APIs
├── resume_converter/ # Resume conversion module
├── config/            # Django settings and URL configuration
├── frontend/          # React/Vite application
├── manage.py
├── requirements.txt
└── README.md
```

## Getting started

Run the backend and frontend in separate terminals from the repository root.

### 1. Backend

Create and activate a virtual environment, then install the Python dependencies:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

On macOS or Linux, activate it with `source .venv/bin/activate`.

Apply database migrations and start Django:

```bash
python manage.py migrate
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

The frontend defaults to the Django API on port `8000` when served from port `5173`. To use a different API origin, set `VITE_API_BASE_URL` in the frontend environment, for example `http://127.0.0.1:8000/api/`.

### Optional environment settings

The backend reads a `.env` file from the repository root. Useful settings include:

```dotenv
SECRET_KEY=replace-with-a-long-random-secret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Use a private production secret, set `DEBUG=False`, and configure production hosts, HTTPS, database, email, and media storage before deployment. Do not commit secrets or uploaded employee documents.

## Timesheet workflow

1. HR/Admin assigns an on-site employee to a project and an approver.
2. The employee opens a Monday-starting week, adds daily hours and descriptions, attaches the required PDF, and submits it.
3. The assigned approver approves the timesheet or requests changes.
4. An approved timesheet moves to Finance for processing.
5. Finance marks it processed, optionally adding a finance/payroll reference.
6. HR/Admin can review the approval and Finance history and record payroll days and hours. These payroll figures are records and do not change the submitted timesheet.

## API overview

All routes are under `/api/`. Authentication uses the `/api/users/` routes; protected requests use the access token as a bearer token.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/users/login/` | Sign in and receive JWT tokens |
| `POST` | `/api/users/refresh/` | Refresh the access token using the refresh cookie |
| `GET`, `PATCH` | `/api/users/profile/` | Read profile and upload a profile photo |
| `GET` | `/api/hr/employees/` | List employee records (HR/Admin) |
| `POST` | `/api/hr/employees/` | Create an employee (HR/Admin) |
| `GET`, `POST` | `/api/timesheets/periods/` | List or open weekly timesheets |
| `GET` | `/api/timesheets/approvals/` | View assigned approvals or HR/Admin oversight |
| `GET` | `/api/timesheets/finance/` | View the Finance processing queue |
| `GET` | `/api/timesheets/payroll-records/` | View Finance history and payroll records (HR/Admin) |
| `GET` | `/api/attendance/` | Access attendance records, subject to role permissions |

## Useful commands

```bash
python manage.py check
python manage.py makemigrations
python manage.py migrate
```

From `frontend/`, create a production bundle with `npm run build`.

## Author

**Saahil Waddhwa** — Software Developer
