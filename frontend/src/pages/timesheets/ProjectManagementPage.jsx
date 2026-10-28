import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Building2, LoaderCircle, Pencil, Plus, RefreshCw, Save, Trash2, UserRound, X } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api";

const tabs = [
  { id: "clients", label: "Clients", icon: Building2 },
  { id: "projects", label: "Projects", icon: BriefcaseBusiness },
  { id: "assignments", label: "Employee assignments", icon: UserRound },
];

const emptyClient = { name: "", code: "", is_active: true };
const emptyProject = { client: "", name: "", code: "", site_name: "", is_active: true };
const emptyAssignment = {
  employee: "", project: "", approver: "", start_date: "", end_date: "",
  expected_daily_minutes: 480, is_active: true,
};
const inputClass = "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function asList(data) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
}

function errorMessage(error) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(" ") : typeof value === "string" ? value : JSON.stringify(value)}`)
      .join(" · ");
  }
  return "The request failed. Please try again.";
}

function StatusBadge({ active }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{active ? "Active" : "Inactive"}</span>;
}

export default function ProjectManagementPage() {
  const [tab, setTab] = useState("clients");
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [clientForm, setClientForm] = useState(emptyClient);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignment);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientResponse, projectResponse, assignmentResponse, employeeResponse, approverResponse] = await Promise.all([
        API.get("timesheets/clients/"),
        API.get("timesheets/projects/"),
        API.get("timesheets/assignments/"),
        API.get("hr/employees/"),
        API.get("timesheets/approvers/"),
      ]);
      setClients(asList(clientResponse.data));
      setProjects(asList(projectResponse.data));
      setAssignments(asList(assignmentResponse.data));
      setEmployees(asList(employeeResponse.data).filter((employee) => employee.is_active && employee.attendance_category === "On-site"));
      setApprovers(asList(approverResponse.data));
    } catch (error) {
      toast.error(`Could not load project setup: ${errorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadData]);

  const filteredClients = useMemo(() => clients.filter((item) => `${item.name} ${item.code}`.toLowerCase().includes(search.toLowerCase())), [clients, search]);
  const filteredProjects = useMemo(() => projects.filter((item) => `${item.name} ${item.code} ${item.client_name} ${item.site_name}`.toLowerCase().includes(search.toLowerCase())), [projects, search]);
  const filteredAssignments = useMemo(() => assignments.filter((item) => `${item.employee_name} ${item.employee_id} ${item.project_name} ${item.client_name} ${item.approver_name}`.toLowerCase().includes(search.toLowerCase())), [assignments, search]);

  function resetForm() {
    setEditingId(null);
    setClientForm(emptyClient);
    setProjectForm(emptyProject);
    setAssignmentForm(emptyAssignment);
  }

  async function saveRecord(event, kind) {
    event.preventDefault();
    setSaving(true);
    const isEditing = editingId !== null;
    const endpoint = kind === "client" ? "timesheets/clients/" : kind === "project" ? "timesheets/projects/" : "timesheets/assignments/";
    const values = kind === "client" ? clientForm : kind === "project" ? projectForm : {
      ...assignmentForm,
      employee: Number(assignmentForm.employee),
      project: Number(assignmentForm.project),
      approver: Number(assignmentForm.approver),
      expected_daily_minutes: Number(assignmentForm.expected_daily_minutes),
      end_date: assignmentForm.end_date || null,
    };
    try {
      if (isEditing) await API.patch(`${endpoint}${editingId}/`, values);
      else await API.post(endpoint, values);
      toast.success(`${kind === "client" ? "Client" : kind === "project" ? "Project" : "Assignment"} ${isEditing ? "updated" : "created"}.`);
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function editClient(item) {
    setTab("clients"); setEditingId(item.id);
    setClientForm({ name: item.name, code: item.code, is_active: item.is_active });
  }

  function editProject(item) {
    setTab("projects"); setEditingId(item.id);
    setProjectForm({ client: String(item.client), name: item.name, code: item.code, site_name: item.site_name || "", is_active: item.is_active });
  }

  function editAssignment(item) {
    setTab("assignments"); setEditingId(item.id);
    setAssignmentForm({
      employee: String(item.employee), project: String(item.project), approver: String(item.approver),
      start_date: item.start_date, end_date: item.end_date || "",
      expected_daily_minutes: item.expected_daily_minutes, is_active: item.is_active,
    });
  }

  async function toggleActive(kind, item) {
    const endpoint = kind === "client" ? "timesheets/clients/" : kind === "project" ? "timesheets/projects/" : "timesheets/assignments/";
    try {
      await API.patch(`${endpoint}${item.id}/`, { is_active: !item.is_active });
      toast.success(`${kind[0].toUpperCase()}${kind.slice(1)} ${item.is_active ? "deactivated" : "activated"}.`);
      await loadData();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function deleteRecord(kind, item) {
    const name = kind === "client" ? item.name : kind === "project" ? item.name : `${item.employee_name} · ${item.project_name}`;
    if (!window.confirm(`Delete ${name}? If attendance, timesheet, project, or assignment records depend on it, deletion will be blocked. Deactivate it to retain history.`)) return;
    const endpoint = kind === "client" ? "timesheets/clients/" : kind === "project" ? "timesheets/projects/" : "timesheets/assignments/";
    try {
      await API.delete(`${endpoint}${item.id}/`);
      toast.success(`${kind[0].toUpperCase()}${kind.slice(1)} deleted.`);
      if (editingId === item.id) resetForm();
      await loadData();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  const activeClients = clients.filter((item) => item.is_active);
  const activeClientIds = new Set(activeClients.map((item) => item.id));
  const activeProjects = projects.filter((item) => item.is_active && activeClientIds.has(item.client));
  const selectedEmployee = employees.find((item) => String(item.id) === assignmentForm.employee);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Admin / HR setup</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Clients, projects & assignments</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">Manage client projects and assign On-site employees with dates and approvers. Changes save to the same records used by attendance and timesheets.</p>
        </div>
        <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/> Refresh</button>
      </header>

      <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Project setup sections">
        {tabs.map((item) => <button key={item.id} type="button" onClick={() => { setTab(item.id); resetForm(); }} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === item.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}><item.icon size={17}/>{item.label}</button>)}
      </nav>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(300px,390px)_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit" : "Add"} {tab === "clients" ? "client" : tab === "projects" ? "project" : "employee assignment"}</h2><p className="mt-1 text-xs text-slate-500">Fields marked with * are required.</p></div>{editingId && <button type="button" onClick={resetForm} aria-label="Cancel editing" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={17}/></button>}</div>

          {tab === "clients" && <form className="space-y-4" onSubmit={(event) => saveRecord(event, "client")}>
            <label className="block text-sm font-medium text-slate-700">Client name *<input required maxLength={150} value={clientForm.name} onChange={(event) => setClientForm({ ...clientForm, name: event.target.value })} className={inputClass}/></label>
            <label className="block text-sm font-medium text-slate-700">Unique client code *<input required maxLength={30} value={clientForm.code} onChange={(event) => setClientForm({ ...clientForm, code: event.target.value.toUpperCase() })} className={inputClass}/></label>
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={clientForm.is_active} onChange={(event) => setClientForm({ ...clientForm, is_active: event.target.checked })}/>Active client</label>
            <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={17}/> : editingId ? <Save size={17}/> : <Plus size={17}/>} {editingId ? "Save client" : "Add client"}</button>
          </form>}

          {tab === "projects" && <form className="space-y-4" onSubmit={(event) => saveRecord(event, "project")}>
            <label className="block text-sm font-medium text-slate-700">Client *<select required value={projectForm.client} onChange={(event) => setProjectForm({ ...projectForm, client: event.target.value })} className={inputClass}><option value="">Select active client</option>{activeClients.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">Project name *<input required maxLength={150} value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} className={inputClass}/></label>
            <label className="block text-sm font-medium text-slate-700">Project code *<input required maxLength={30} value={projectForm.code} onChange={(event) => setProjectForm({ ...projectForm, code: event.target.value.toUpperCase() })} className={inputClass}/><span className="mt-1 block text-xs text-slate-400">Code must be unique within its client.</span></label>
            <label className="block text-sm font-medium text-slate-700">Client site / location<input maxLength={150} value={projectForm.site_name} onChange={(event) => setProjectForm({ ...projectForm, site_name: event.target.value })} className={inputClass}/></label>
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={projectForm.is_active} onChange={(event) => setProjectForm({ ...projectForm, is_active: event.target.checked })}/>Active project</label>
            <button disabled={saving || !activeClients.length} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={17}/> : editingId ? <Save size={17}/> : <Plus size={17}/>} {editingId ? "Save project" : "Add project"}</button>
            {!activeClients.length && <p className="text-xs text-amber-700">Add an active client before creating a project.</p>}
          </form>}

          {tab === "assignments" && <form className="space-y-4" onSubmit={(event) => saveRecord(event, "assignment")}>
            <label className="block text-sm font-medium text-slate-700">On-site employee *<select required value={assignmentForm.employee} onChange={(event) => setAssignmentForm({ ...assignmentForm, employee: event.target.value })} className={inputClass}><option value="">Select active On-site employee</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.full_name} · {item.employee_id}</option>)}</select></label>
            {assignmentForm.employee && !selectedEmployee && <p className="-mt-2 text-xs text-amber-700">This employee is no longer active or On-site. Choose another employee.</p>}
            <label className="block text-sm font-medium text-slate-700">Client project *<select required value={assignmentForm.project} onChange={(event) => setAssignmentForm({ ...assignmentForm, project: event.target.value })} className={inputClass}><option value="">Select active project</option>{activeProjects.map((item) => <option key={item.id} value={item.id}>{item.client_name} · {item.name}{item.site_name ? ` · ${item.site_name}` : ""}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">Project approver *<select required value={assignmentForm.approver} onChange={(event) => setAssignmentForm({ ...assignmentForm, approver: event.target.value })} className={inputClass}><option value="">Select active approver</option>{approvers.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.email} ({item.role})</option>)}</select><span className="mt-1 block text-xs text-slate-400">The selected account receives this project's employee timesheet submissions.</span></label>
            <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium text-slate-700">Start date *<input type="date" required value={assignmentForm.start_date} onChange={(event) => setAssignmentForm({ ...assignmentForm, start_date: event.target.value })} className={inputClass}/></label><label className="block text-sm font-medium text-slate-700">End date<input type="date" min={assignmentForm.start_date || undefined} value={assignmentForm.end_date} onChange={(event) => setAssignmentForm({ ...assignmentForm, end_date: event.target.value })} className={inputClass}/></label></div>
            <label className="block text-sm font-medium text-slate-700">Expected work minutes per weekday *<input type="number" min="1" max="1440" required value={assignmentForm.expected_daily_minutes} onChange={(event) => setAssignmentForm({ ...assignmentForm, expected_daily_minutes: event.target.value })} className={inputClass}/><span className="mt-1 block text-xs text-slate-400">480 minutes means 8 hours.</span></label>
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={assignmentForm.is_active} onChange={(event) => setAssignmentForm({ ...assignmentForm, is_active: event.target.checked })}/>Active assignment</label>
            <button disabled={saving || !employees.length || !activeProjects.length || !approvers.length} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={17}/> : editingId ? <Save size={17}/> : <Plus size={17}/>} {editingId ? "Save assignment" : "Assign employee"}</button>
            {!employees.length && <p className="text-xs text-amber-700">There are no active On-site employees. Update an employee’s attendance category first.</p>}
          </form>}
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h2 className="text-lg font-bold text-slate-900">{tab === "clients" ? "Clients" : tab === "projects" ? "Projects" : "Employee project assignments"}</h2><p className="mt-1 text-xs text-slate-500">{tab === "clients" ? clients.length : tab === "projects" ? projects.length : assignments.length} records · deactivation preserves attendance and timesheet history</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"/></div>
          {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/>Loading project setup…</div> : <div className="overflow-x-auto">
            {tab === "clients" && <table className="min-w-[650px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Client</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Projects</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredClients.map((item) => <tr key={item.id}><td className="px-5 py-4 font-semibold text-slate-800">{item.name}</td><td className="px-5 py-4 text-slate-600">{item.code}</td><td className="px-5 py-4">{item.project_count}</td><td className="px-5 py-4"><StatusBadge active={item.is_active}/></td><td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => editClient(item)} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"><Pencil size={14}/></button><button type="button" onClick={() => toggleActive("client", item)} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50">{item.is_active ? "Deactivate" : "Activate"}</button><button type="button" onClick={() => deleteRecord("client", item)} aria-label="Delete client" className="rounded-lg border p-2 text-rose-700 hover:bg-rose-50"><Trash2 size={14}/></button></div></td></tr>)}</tbody></table>}
            {tab === "projects" && <table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Project / Site</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Assignments</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredProjects.map((item) => <tr key={item.id}><td className="px-5 py-4"><div className="font-semibold text-slate-800">{item.name}</div><div className="text-xs text-slate-500">{item.site_name || "No site entered"}</div></td><td className="px-5 py-4">{item.client_name}</td><td className="px-5 py-4">{item.code}</td><td className="px-5 py-4">{item.assignment_count}</td><td className="px-5 py-4"><StatusBadge active={item.is_active}/></td><td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => editProject(item)} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"><Pencil size={14}/></button><button type="button" onClick={() => toggleActive("project", item)} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50">{item.is_active ? "Deactivate" : "Activate"}</button><button type="button" onClick={() => deleteRecord("project", item)} aria-label="Delete project" className="rounded-lg border p-2 text-rose-700 hover:bg-rose-50"><Trash2 size={14}/></button></div></td></tr>)}</tbody></table>}
            {tab === "assignments" && <table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Client / project</th><th className="px-4 py-3">Approver</th><th className="px-4 py-3">Assignment dates</th><th className="px-4 py-3">Expected / day</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredAssignments.map((item) => <tr key={item.id}><td className="px-4 py-4"><div className="font-semibold text-slate-800">{item.employee_name}</div><div className="text-xs text-slate-500">{item.employee_id}</div></td><td className="px-4 py-4"><div className="font-medium">{item.project_name}</div><div className="text-xs text-slate-500">{item.client_name} · {item.site_name || "Site not set"}</div></td><td className="px-4 py-4"><div>{item.approver_name}</div><div className="text-xs text-slate-500">{item.approver_email}</div></td><td className="px-4 py-4 text-xs text-slate-600">{item.start_date} – {item.end_date || "Ongoing"}</td><td className="px-4 py-4">{(item.expected_daily_minutes / 60).toFixed(2)} hrs</td><td className="px-4 py-4"><StatusBadge active={item.is_active}/></td><td className="px-4 py-4"><div className="flex gap-2"><button type="button" onClick={() => editAssignment(item)} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"><Pencil size={14}/></button><button type="button" onClick={() => toggleActive("assignment", item)} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50">{item.is_active ? "Deactivate" : "Activate"}</button><button type="button" onClick={() => deleteRecord("assignment", item)} aria-label="Delete assignment" className="rounded-lg border p-2 text-rose-700 hover:bg-rose-50"><Trash2 size={14}/></button></div></td></tr>)}</tbody></table>}
            {(tab === "clients" ? filteredClients.length : tab === "projects" ? filteredProjects.length : filteredAssignments.length) === 0 && <p className="p-10 text-center text-sm text-slate-500">No matching records. Add one with the form.</p>}
          </div>}
        </section>
      </div>
    </div>
  );
}
