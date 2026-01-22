import { useState } from "react";
import { createCustomer } from "../../api/customers";

export default function AddCustomerModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    category: "Regular"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.mobile) {
      setError("Name and mobile are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createCustomer({
        name: form.name,
        mobile: form.mobile,
        category: form.category,
        measurements: {}
      });

      onSuccess?.();   // reload dashboard data
      onClose();       // close modal
    } catch (err) {
      setError("Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-6">
          Add Customer
        </h2>

        {/* FORM */}
        <div className="space-y-4">

          <input
            className="w-full border border-slate-300 rounded-xl px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Customer Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="w-full border border-slate-300 rounded-xl px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={e => setForm({ ...form, mobile: e.target.value })}
          />

          <select
            className="w-full border border-slate-300 rounded-xl px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Occasional">Occasional</option>
          </select>

          {error && (
            <p className="text-red-600 text-sm font-semibold">
              {error}
            </p>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-slate-300
                text-slate-600 font-semibold hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white
                font-semibold hover:bg-black disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add Customer"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
