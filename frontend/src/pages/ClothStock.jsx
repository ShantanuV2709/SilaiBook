import { useEffect, useState } from "react";
import {
  fetchClothStock,
  createClothStock,
  useCloth,
  updateClothStock,
  deleteClothStock
} from "../api/clothStock";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


export default function ClothStock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- ADD FORM ---------------- */
  const [form, setForm] = useState({
    dealer_name: "",
    cloth_type: "Cotton",
    total_meters: "",
    price_per_meter: "",
    purchase_date: ""
  });

  /* ---------------- EDIT ---------------- */
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadStock = async () => {
    setLoading(true);
    const data = await fetchClothStock();
    setStock(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStock();
  }, []);

  /* ---------------- ADD STOCK ---------------- */
  const addStock = async () => {
    const { dealer_name, cloth_type, total_meters, price_per_meter, purchase_date } = form;
    if (!dealer_name || !total_meters || !price_per_meter) return;

    await createClothStock({
      dealer_name,
      cloth_type,
      total_meters: Number(total_meters),
      price_per_meter: Number(price_per_meter),
      purchase_date
    });

    setForm({
      dealer_name: "",
      cloth_type: "Cotton",
      total_meters: "",
      price_per_meter: "",
      purchase_date: ""
    });

    loadStock();
  };

  /* ---------------- USE METERS ---------------- */
  const useMeters = async (id) => {
    const value = prompt("Meters used:");
    if (!value) return;
    await useCloth(id, Number(value));
    loadStock();
  };

  /* ---------------- EDIT ---------------- */
  const startEdit = (s) => {
    setEditingId(s._id);
    setEditForm({
      dealer_name: s.dealer_name,
      cloth_type: s.cloth_type,
      price_per_meter: s.price_per_meter
    });
  };

  const saveEdit = async (id) => {
    await updateClothStock(id, editForm);
    setEditingId(null);
    loadStock();
  };

  const deleteStock = async (id) => {
    if (!window.confirm("Delete this cloth entry?")) return;
    await deleteClothStock(id);
    loadStock();
  };

  /* ---------------- DEALER SUMMARY ---------------- */
  const dealerSummary = stock.reduce((acc, s) => {
  acc[s.dealer_name] = (acc[s.dealer_name] || 0) + s.remaining_meters;
  return acc;
}, {});

 const totalAvailable = stock.reduce(
    (sum, s) => sum + s.remaining_meters,
    0
  );

  const totalUsed = stock.reduce(
    (sum, s) => sum + (s.used_meters || 0),
    0
  );

  const finishedStockCount = stock.filter(
    s => s.remaining_meters === 0
  ).length;

  const lowStockCount = stock.filter(
    s => s.remaining_meters <= 10
  ).length;

  const categoryStock = stock.reduce((acc, s) => {
    acc[s.cloth_type] = (acc[s.cloth_type] || 0) + s.remaining_meters;
    return acc;
  }, {});



  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">

        <h1 className="text-3xl font-black text-slate-900">
          Cloth / Fabric Management
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <div className="bg-white rounded-3xl p-6 border border-slate-100">
    <p className="text-sm text-slate-500">Available Stock</p>
    <p className="text-3xl font-black">{totalAvailable} m</p>
  </div>

  <div className="bg-white rounded-3xl p-6 border border-slate-100">
    <p className="text-sm text-slate-500">Used Stock</p>
    <p className="text-3xl font-black">{totalUsed} m</p>
  </div>

  <div className="bg-white rounded-3xl p-6 border border-slate-100">
    <p className="text-sm text-slate-500">Finished Entries</p>
    <p className="text-3xl font-black">{finishedStockCount}</p>
  </div>

  <div className="bg-white rounded-3xl p-6 border border-slate-100">
    <p className="text-sm text-slate-500">Low Stock Alerts</p>
    <p className="text-3xl font-black text-red-600">{lowStockCount}</p>
  </div>
</div>


        {/* ADD STOCK */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow">
          <h2 className="font-bold mb-6">Add New Cloth</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-slate-400"
              placeholder="Dealer / Supplier"
              value={form.dealer_name}
              onChange={e => setForm({ ...form, dealer_name: e.target.value })}
            />

            <select
              className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm"
              value={form.cloth_type}
              onChange={e => setForm({ ...form, cloth_type: e.target.value })}
            >
              <option>Cotton</option>
              <option>Silk</option>
              <option>Suiting</option>
              <option>Linen</option>
            </select>

            <input
              type="number"
              className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm"
              placeholder="Total meters"
              value={form.total_meters}
              onChange={e => setForm({ ...form, total_meters: e.target.value })}
            />

            <input
              type="number"
              className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm"
              placeholder="Price / meter"
              value={form.price_per_meter}
              onChange={e => setForm({ ...form, price_per_meter: e.target.value })}
            />

            <input
              type="date"
              className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm"
              value={form.purchase_date}
              onChange={e => setForm({ ...form, purchase_date: e.target.value })}
            />
          </div>

          <button
            onClick={addStock}
            className="mt-6 px-8 py-3 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-black transition"
          >
            Add Cloth
          </button>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100">
  <h2 className="font-bold mb-4">Category-wise Stock</h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Object.entries(categoryStock).map(([type, meters]) => (
      <div key={type} className="text-slate-700">
        <p className="text-sm text-slate-500">{type}</p>
        <p className="text-xl font-bold">{meters} m</p>
      </div>
    ))}
  </div>
</div>


        {/* DEALER SUMMARY */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100">
          <h2 className="font-bold mb-4">Dealer-wise  Cloth</h2>
          <ul className="space-y-2 text-slate-700">
            {Object.entries(dealerSummary).map(([dealer, meters]) => (
              <li key={dealer}>
                <strong>{dealer}</strong> — {meters} m
              </li>
            ))}
          </ul>
        </div>


        {/* STOCK TABLE */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          {loading ? (
            <p className="p-6 text-slate-400">Loading stock…</p>
          ) : (
       <table className="w-full table-fixed">
        <colgroup>
        <col className="w-[22%]" />  {/* Dealer */}
        <col className="w-[16%]" />  {/* Type */}
        <col className="w-[14%]" />  {/* Remaining */}
        <col className="w-[14%]" />  {/* Price */}
        <col className="w-[14%]" />  {/* Date */}
        <col className="w-[20%]" />  {/* Actions */}
      </colgroup>


  <thead>
  <tr className="text-sm text-slate-500 border-b">
    <th className="py-4 px-6 text-left">Dealer</th>
    <th className="text-left">Type</th>
    <th className="text-center">Remaining (m)</th>
    <th className="text-center">Price</th>
    <th className="text-center">Stocked On</th>
    <th className="text-center">Actions</th>
  </tr>
</thead>


  <tbody>
    {stock.map((s) => (
      <tr key={s._id} className="border-t">
        {/* Dealer */}
        <td className="py-4 px-6 text-left">
          {editingId === s._id ? (
            <input
              className="border border-slate-300 rounded-lg px-3 py-2 w-full"
              value={editForm.dealer_name}
              onChange={(e) =>
                setEditForm({ ...editForm, dealer_name: e.target.value })
              }
            />
          ) : (
            s.dealer_name
          )}
        </td>

        {/* Type */}
        <td className="text-left">
          {editingId === s._id ? (
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 w-full"
              value={editForm.cloth_type}
              onChange={(e) =>
                setEditForm({ ...editForm, cloth_type: e.target.value })
              }
            >
              <option>Cotton</option>
              <option>Silk</option>
              <option>Suiting</option>
              <option>Linen</option>
            </select>
          ) : (
            s.cloth_type
          )}
        </td>

        {/* Remaining */}
        <td className="text-center">
          <span
            className={
              s.remaining_meters < 10
                ? "text-red-600 font-semibold"
                : ""
            }
          >
            {s.remaining_meters}
          </span>
        </td>

        {/* Price */}
        <td className="text-center">
          {editingId === s._id ? (
            <input
              type="number"
              className="
                border border-slate-300
                rounded-lg
                px-3 py-2
                w-24
                text-center
                focus:outline-none
                focus:ring-2
                focus:ring-slate-900
              "
              value={editForm.price_per_meter}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  price_per_meter: e.target.value
                })
              }
            />
          ) : (
            `₹ ${s.price_per_meter}`
          )}
        </td>
        <td className="p-4 text-slate-600">
          {formatDate(s.last_stocked_at || s.purchase_date)}
        </td>



        {/* Actions */}
        <td className="text-center">
          {editingId === s._id ? (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => saveEdit(s._id)}
                className="px-4 py-2 rounded-xl border border-slate-400 text-slate-700 text-sm hover:border-slate-900"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-500 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => useMeters(s._id)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm hover:border-slate-900"
              >
                Use
              </button>
              <button
                onClick={() => startEdit(s)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm hover:border-slate-900"
              >
                Edit
              </button>
              <button
                onClick={() => deleteStock(s._id)}
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
