import { useState } from "react";
import { createCustomer } from "../../api/customers";
import api from "../../api/api";

export default function AddCustomerModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    category: "Regular",
    photo_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload Photo
      const res = await api.post("/customers/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm(prev => ({ ...prev, photo_url: res.data.url }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

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
        photo_url: form.photo_url,
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl overflow-hidden">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">
          Add Customer
        </h2>

        {/* FORM */}
        <div className="space-y-4">

          {/* PHOTO UPLOAD */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-600 flex items-center justify-center">
              {form.photo_url ? (
                <img src={form.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-slate-300 dark:text-slate-500">📷</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600"
              />
              {uploading && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Uploading...</p>}
            </div>
          </div>

          <input
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 placeholder:text-slate-400"
            placeholder="Customer Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 placeholder:text-slate-400"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={e => setForm({ ...form, mobile: e.target.value })}
          />

          <select
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Occasional">Occasional</option>
          </select>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm font-semibold">
              {error}
            </p>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600
                text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || uploading}
              className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900
                font-semibold hover:bg-black dark:hover:bg-slate-200 disabled:opacity-60 shadow-lg shadow-slate-900/20 dark:shadow-none transition"
            >
              {loading ? "Adding..." : "Add Customer"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
