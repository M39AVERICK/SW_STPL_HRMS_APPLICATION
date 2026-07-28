{/* 🔷 Resource Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Resources</h2>

        {resources.map((res, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 mb-2">

            <input
              className="border p-2"
              placeholder="Name"
              onChange={(e) =>
                handleResourceChange(index, "name", e.target.value)
              }
            />

            <input
              type="number"
              className="border p-2"
              placeholder="Rate"
              onChange={(e) =>
                handleResourceChange(index, "rate", Number(e.target.value))
              }
            />

            <input
              type="number"
              className="border p-2"
              placeholder="Hours"
              onChange={(e) =>
                handleResourceChange(index, "hours", Number(e.target.value))
              }
            />

            <button
              className="bg-red-500 text-white rounded"
              onClick={() => deleteRow(index)}
            >
              Delete
            </button>

          </div>
        ))}

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          onClick={addRow}
        >
          Add Resource
        </button>
      </div>
