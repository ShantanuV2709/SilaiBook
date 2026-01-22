import { useEffect, useState } from "react";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/customers";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    category: "Regular",
  });

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    category: "Regular",
  });

  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    const data = await fetchCustomers();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  /* ---------------- ADD ---------------- */

  const addCustomer = async () => {
    if (!form.name || !form.mobile) return;

    await createCustomer({
      ...form,
      measurements: {},
    });

    setForm({ name: "", mobile: "", category: "Regular" });
    loadCustomers();
  };

  /* ---------------- EDIT ---------------- */

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditForm({
      name: c.name,
      mobile: c.mobile,
      category: c.category,
    });
  };

  const saveEdit = async (id) => {
    await updateCustomer(id, editForm);
    setEditingId(null);
    loadCustomers();
  };

  const cancelEdit = () => setEditingId(null);

  /* ---------------- DELETE ---------------- */

  const removeCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    await deleteCustomer(id);
    loadCustomers();
  };

  /* ---------------- FILTER ---------------- */

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">

        <h1 className="text-3xl font-black text-slate-900">
          Customers
        </h1>

        {/* ADD CUSTOMER */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow">
          <h2 className="font-bold mb-6">Add New Customer</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              className="border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="Customer name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              className="border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="Mobile number"
              value={form.mobile}
              onChange={(e) =>
                setForm({ ...form, mobile: e.target.value })
              }
            />

            <select
              className="border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option>Regular</option>
              <option>VIP</option>
              <option>Occasional</option>
            </select>

            <button
              onClick={addCustomer}
              disabled={!form.name || !form.mobile}
              className="
                rounded-xl
                border border-slate-900
                bg-slate-900 text-white
                font-semibold
                hover:bg-black
                disabled:opacity-40
                transition
              "
            >
              Add Customer
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          className="
            w-full md:w-80
            border border-slate-300
            rounded-xl px-4 py-3
            focus:ring-2 focus:ring-slate-900
            outline-none
          "
          placeholder="Search by name or mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CUSTOMER TABLE */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          {loading ? (
            <p className="p-6 text-slate-400">Loading customers…</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="p-6 text-slate-400">No customers found</p>
          ) : (
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[25%]" />
                <col className="w-[20%]" />
                <col className="w-[25%]" />
              </colgroup>

              <thead>
                <tr className="text-sm text-slate-500 border-b">
                  <th className="py-4 px-6 text-left">Name</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-left">Category</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c._id} className="border-t">
                    <td className="py-4 px-6">
                      {editingId === c._id ? (
                        <input
                          className="border border-slate-300 rounded-lg px-3 py-2 w-full"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        c.name
                      )}
                    </td>

                    <td>
                      {editingId === c._id ? (
                        <input
                          className="border border-slate-300 rounded-lg px-3 py-2 w-full"
                          value={editForm.mobile}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              mobile: e.target.value,
                            })
                          }
                        />
                      ) : (
                        c.mobile
                      )}
                    </td>

                    <td>
                      {editingId === c._id ? (
                        <select
                          className="border border-slate-300 rounded-lg px-3 py-2"
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              category: e.target.value,
                            })
                          }
                        >
                          <option>Regular</option>
                          <option>VIP</option>
                          <option>Occasional</option>
                        </select>
                      ) : (
                        c.category
                      )}
                    </td>

                    <td className="text-center">
                      {editingId === c._id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => saveEdit(c._id)}
                            className="px-4 py-2 rounded-xl border border-slate-400 text-slate-700 text-sm hover:border-slate-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-500 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEdit(c)}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm hover:border-slate-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeCustomer(c._id)}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-500 text-sm hover:border-red-400 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
