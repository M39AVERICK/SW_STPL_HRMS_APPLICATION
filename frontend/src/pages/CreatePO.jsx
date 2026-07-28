import { useState, useEffect } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

function CreatePO() {

  // 🔹 States
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [vendor, setVendor] = useState("");
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState("");

  const [resources, setResources] = useState([
    { name: "", rate: 0, hours: 0 }
  ]);

  const [gst, setGst] = useState(18);
  const [tds, setTds] = useState(10);

  const [files, setFiles] = useState([]);

  // 🔹 Load dropdown data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const vendorRes = await API.get("vendors/");
      const customerRes = await API.get("customers/");
      setVendors(vendorRes.data);
      setCustomers(customerRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // 🔹 Fetch vendor files
  useEffect(() => {
    if (vendor) {
      fetchFiles();
    }
  }, [vendor]);

  const fetchFiles = async () => {
    try {
      const res = await API.get(`vendor-files/${vendor}/`);
      setFiles(res.data);
    } catch (err) {
      console.error("File Fetch Error:", err);
    }
  };

  // 🔹 Resource handlers
  const handleResourceChange = (index, field, value) => {
    const updated = [...resources];
    updated[index][field] = value;
    setResources(updated);
  };

  const addRow = () => {
    setResources([...resources, { name: "", rate: 0, hours: 0 }]);
  };

  const deleteRow = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  // 🔹 Calculations
  const subtotal = resources.reduce(
    (acc, item) => acc + item.rate * item.hours,
    0
  );

  const gstAmount = (subtotal * gst) / 100;
  const tdsAmount = (subtotal * tds) / 100;
  const total = subtotal + gstAmount - tdsAmount;

  // 🔹 Submit
  const handleSubmit = async () => {

    // ✅ Validation
    if (!vendor || !customer || !date) {
      alert("Please fill all fields");
      return;
    }

    if (resources.some(r => !r.name || r.rate <= 0 || r.hours <= 0)) {
      alert("Enter valid resource data");
      return;
    }

    try {
      await API.post("po/", {
        vendor,
        customer,
        date,      // ✅ REQUIRED
        gst,
        tds,
        resources  // ✅ ONLY THIS (no subtotal/total)
      });

      alert("PO Created Successfully ✅");

      // reset
      setResources([{ name: "", rate: 0, hours: 0 }]);
      fetchFiles();

    } catch (err) {
      console.error("REAL ERROR:", err.response?.data);
      alert("Error creating PO ❌");
    }
  };

  return (
    <Layout>
      <div className="p-6 grid grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="col-span-2 space-y-6">

          {/* 🔹 Top Fields */}
          <div className="grid grid-cols-3 gap-4">

            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="border p-2"
            >
              <option value="">Select Vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>

            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="border p-2"
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2"
            />
          </div>

          {/* 🔹 Resource Table */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Resources</h2>

            {resources.map((r, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input
                  placeholder="Name"
                  value={r.name}
                  onChange={(e) => handleResourceChange(i, "name", e.target.value)}
                  className="border p-2"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={r.rate}
                  onChange={(e) => handleResourceChange(i, "rate", Number(e.target.value))}
                  className="border p-2"
                />
                <input
                  type="number"
                  placeholder="Hours"
                  value={r.hours}
                  onChange={(e) => handleResourceChange(i, "hours", Number(e.target.value))}
                  className="border p-2"
                />
                <button
                  onClick={() => deleteRow(i)}
                  className="bg-red-500 text-white"
                >
                  X
                </button>
              </div>
            ))}

            <button
              onClick={addRow}
              className="bg-blue-500 text-white px-4 py-2 mt-2"
            >
              Add Row
            </button>
          </div>

          {/* 🔹 Summary */}
          <div className="bg-white p-4 rounded-xl shadow">
            <p>Subtotal: ₹{subtotal}</p>
            <p>GST: ₹{gstAmount}</p>
            <p>TDS: ₹{tdsAmount}</p>
            <h3 className="font-bold">Total: ₹{total}</h3>
          </div>

          {/* 🔹 Button */}
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Generate PO
          </button>

        </div>

        {/* RIGHT SIDE PANEL */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">📁 Vendor Documents</h2>

          {!vendor ? (
            <p>Select a vendor</p>
          ) : files.length === 0 ? (
            <p>No files</p>
          ) : (
            files.map(f => (
              <div key={f.id} className="border p-2 mb-2 rounded">
                <p>PO #{f.id}</p>
                <p>₹{f.total}</p>

                <a
                  href={`http://127.0.0.1:8000${f.file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500"
                >
                  Open
                </a>
              </div>
            ))
          )}
        </div>

      </div>
    </Layout>
  );
}

export default CreatePO;