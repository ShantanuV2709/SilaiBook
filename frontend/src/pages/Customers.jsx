import { useEffect, useState } from "react";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/customers";
import CustomerOrdersModal from "../components/modals/CustomerOrdersModal";

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

  const [historyCustomer, setHistoryCustomer] = useState(null);

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
    <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-6 md:space-y-10">

        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
          Customers
        </h1>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Total Customers - Violet */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/20 rounded-3xl p-6 border-2 border-violet-200 dark:border-violet-800 shadow-lg">
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-400 mb-2">Total Customers</p>
            <p className="text-3xl font-black text-violet-900 dark:text-violet-100">{filteredCustomers.length}</p>
            <p className="text-xs text-violet-600 dark:text-violet-500 mt-2">Active Profiles</p>
          </div>

          {/* Regular - Blue */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20 rounded-3xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Regular</p>
            <p className="text-3xl font-black text-blue-900 dark:text-blue-100">
              {customers.filter(c => c.category === 'Regular').length}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">Loyal Clients</p>
          </div>

          {/* VIP - Amber */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/20 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">VIP</p>
            <p className="text-3xl font-black text-amber-900 dark:text-amber-100">
              {customers.filter(c => c.category === 'VIP').length}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">High Value</p>
          </div>
        </div>

        {/* ADD CUSTOMER */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow">
          <h2 className="font-bold mb-6 text-slate-900 dark:text-white">Add New Customer</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none placeholder:text-slate-400"
              placeholder="Customer name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none placeholder:text-slate-400"
              placeholder="Mobile number"
              value={form.mobile}
              onChange={(e) =>
                setForm({ ...form, mobile: e.target.value })
              }
            />

            <select
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none"
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
                border border-slate-900 dark:border-white
                bg-slate-900 dark:bg-white text-white dark:text-slate-900
                font-semibold
                hover:bg-black dark:hover:bg-slate-200
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
            border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white
            rounded-xl px-4 py-3
            focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400
            outline-none placeholder:text-slate-400
          "
          placeholder="Search by name or mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CUSTOMER TABLE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden overflow-x-auto">
          {loading ? (
            <p className="p-6 text-slate-400">Loading customers…</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="p-6 text-slate-400">No customers found</p>
          ) : (
            <table className="w-full table-fixed min-w-[800px]">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[30%]" />
              </colgroup>

              <thead>
                <tr className="text-sm text-slate-500 dark:text-slate-400 border-b dark:border-slate-700">
                  <th className="py-4 px-6 text-left">Name</th>
                  <th className="text-left">Mobile</th>
                  <th className="text-left">Category</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c._id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-6 text-slate-900 dark:text-slate-200">
                      {editingId === c._id ? (
                        <input
                          className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-3 py-2 w-full outline-none"
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

                    <td className="text-slate-600 dark:text-slate-300">
                      {editingId === c._id ? (
                        <input
                          className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-3 py-2 w-full outline-none"
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

                    <td className="text-slate-600 dark:text-slate-300">
                      {editingId === c._id ? (
                        <select
                          className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-3 py-2 outline-none"
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
                        <span className={`px-2 py-1 rounded text-xs font-bold 
                          ${c.category === 'VIP' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            c.category === 'Regular' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                          {c.category}
                        </span>
                      )}
                    </td>

                    <td className="text-center">
                      {editingId === c._id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => saveEdit(c._id)}
                            className="px-4 py-2 rounded-xl border border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-300 text-sm hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-500 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setHistoryCustomer(c)}
                            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-sm font-bold hover:bg-black dark:hover:bg-slate-600"
                          >
                            Orders
                          </button>
                          <button
                            onClick={() => startEdit(c)}
                            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm hover:border-slate-900 dark:hover:border-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeCustomer(c._id)}
                            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-500 text-sm hover:border-red-400 hover:text-red-500"
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

      {/* HISTORY MODAL */}
      {historyCustomer && (
        <CustomerOrdersModal
          customer={historyCustomer}
          onClose={() => setHistoryCustomer(null)}
        />
      )}
    </div>
  );
}
