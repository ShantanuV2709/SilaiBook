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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-6">
          Add Cloth Stock
        </h2>

        <div className="space-y-4">
          <input
            placeholder="Dealer / Supplier Name"
            value={dealerName}
            onChange={e => setDealerName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />

          <select
            value={clothType}
            onChange={e => setClothType(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
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
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />

          <input
            type="number"
            placeholder="Price per meter"
            value={pricePerMeter}
            onChange={e => setPricePerMeter(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />
        </div>

        <button
          onClick={submitStock}
          disabled={loading}
          className="
            mt-6 w-full
            bg-slate-900 text-white
            py-3 rounded-2xl
            font-bold
            hover:bg-black
            transition
            disabled:opacity-50
          "
        >
          {loading ? "Saving..." : "Add Stock"}
        </button>
      </div>
    </div>
  );
}
