import { useState } from "react";
import api from "../../api/api";

export default function AddStockModal({ onClose, onSuccess }) {
  const [dealerName, setDealerName] = useState("");
  const [clothType, setClothType] = useState("Cotton");
  const [totalMeters, setTotalMeters] = useState("");
  const [pricePerMeter, setPricePerMeter] = useState("");
  const [loading, setLoading] = useState(false);

  const submitStock = async () => {
    if (!dealerName || !totalMeters || !pricePerMeter) return;

    setLoading(true);
    try {
      await api.post("/cloth-stock/", {
        dealer_name: dealerName,
        cloth_type: clothType,
        total_meters: Number(totalMeters),
        price_per_meter: Number(pricePerMeter)
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      alert("Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">
          Add Cloth Stock
        </h2>

        <div className="space-y-4">
          <input
            placeholder="Dealer / Supplier Name"
            value={dealerName}
            onChange={e => setDealerName(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          />

          <select
            value={clothType}
            onChange={e => setClothType(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          >
            <option>Cotton</option>
            <option>Silk</option>
            <option>Suiting</option>
            <option>Linen</option>
          </select>

          <input
            type="number"
            placeholder="Total meters received"
            value={totalMeters}
            onChange={e => setTotalMeters(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          />

          <input
            type="number"
            placeholder="Price per meter"
            value={pricePerMeter}
            onChange={e => setPricePerMeter(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          />
        </div>

        <button
          onClick={submitStock}
          disabled={loading}
          className="
            mt-6 w-full
            bg-slate-900 dark:bg-white text-white dark:text-slate-900
            py-3 rounded-2xl
            font-bold
            hover:bg-black dark:hover:bg-slate-200
            transition
            disabled:opacity-50
            shadow-lg shadow-slate-900/20 dark:shadow-none
          "
        >
          {loading ? "Saving..." : "Add Stock"}
        </button>
      </div>
    </div>
  );
}
