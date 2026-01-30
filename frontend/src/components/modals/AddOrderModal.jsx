import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AddOrderModal({ onClose, onSuccess }) {
  /* ===================== */
  /* STATE */
  /* ===================== */
  const [customers, setCustomers] = useState([]);
  const [clothStock, setClothStock] = useState([]);
  const [measurements, setMeasurements] = useState(null);

  const [customerId, setCustomerId] = useState("");
  const [orderType, setOrderType] = useState("Shirt");
  const [clothId, setClothId] = useState("");
  const [metersUsed, setMetersUsed] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(""); // Total Order Cost

  const [advance, setAdvance] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");

  const [loading, setLoading] = useState(false);

  /* ===================== */
  /* LOAD INITIAL DATA */
  /* ===================== */
  useEffect(() => {
    Promise.all([
      api.get("/customers"),
      api.get("/cloth-stock"),
    ])
      .then(([cRes, sRes]) => {
        setCustomers(Array.isArray(cRes.data) ? cRes.data : []);
        setClothStock(Array.isArray(sRes.data) ? sRes.data : []);
      })
      .catch(() => {
        setCustomers([]);
        setClothStock([]);
      });
  }, []);

  /* ===================== */
  /* LOAD MEASUREMENTS */
  /* ===================== */
  useEffect(() => {
    const customer = customers.find(c => c._id === customerId);
    setMeasurements(customer?.measurements || null);
  }, [customerId, customers]);


  /* ===================== */
  /* SUBMIT */
  /* ===================== */
  const submit = async () => {
    if (!customerId || !deliveryDate || !metersUsed || !clothId || !totalPrice) {
      alert("Please fill in all required fields (Customer, Cloth, Meters, Price, Date)");
      return;
    }

    if (Number(metersUsed) <= 0) {
      alert("Meters used must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create order
      const orderRes = await api.post("/orders/", {
        customer_id: customerId,
        order_type: orderType,
        price: Number(totalPrice), // Store price in order
        measurements: measurements || {},
        cloth_items: [
          {
            cloth_stock_id: clothId,
            meters_used: Number(metersUsed),
          },
        ],
        delivery_date: deliveryDate,
        priority: "Normal",
        advance_amount: Number(advance) || 0, // Store advance in order for invoice
      });


      // 2️⃣ Record Payment (Debt + Advance)
      // Always create a payment record to establish the Total Bill (Debt)
      await api.post("/payments", {
        customer_id: customerId,
        total_bill: Number(totalPrice),     // The full cost of the suit
        paid_amount: Number(advance) || 0,  // What they paid now (can be 0)
        payment_mode: paymentMode,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Failed to add order";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== */
  /* UI */
  /* ===================== */
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-lg relative shadow-2xl">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">
          Add Order
        </h2>

        {/* CUSTOMER */}
        <select
          className="input mb-4 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.mobile})
            </option>
          ))}
        </select>

        {/* ORDER TYPE */}
        <select
          className="input mb-4 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option>Shirt</option>
          <option>Pant</option>
          <option>Suit</option>
          <option>Blouse</option>
          <option>Custom</option>
        </select>

        {/* PRICE */}
        <input
          type="number"
          className="input mb-4 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 placeholder:text-slate-400"
          placeholder="Total Price (e.g. 1200)"
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
        />

        {/* MEASUREMENTS PREVIEW */}
        {measurements && Object.keys(measurements).length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-xs mb-4 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
            <p className="font-semibold mb-1 text-slate-900 dark:text-white">Measurements</p>
            <pre>{JSON.stringify(measurements, null, 2)}</pre>
          </div>
        )}


        {/* CLOTH */}
        <select
          className="input mb-3 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          value={clothId}
          onChange={(e) => setClothId(e.target.value)}
        >
          <option value="">Select Cloth</option>
          {clothStock.map(c => {
            const available = c.total_meters - (c.used_meters || 0);
            return (
              <option key={c._id} value={c._id} disabled={available <= 0}>
                {c.cloth_type} – {available}m Avail (Phys: {c.remaining_meters}m)
              </option>
            );
          })}
        </select>

        <input
          type="number"
          className="input mb-4 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 placeholder:text-slate-400"
          placeholder="Meters Used"
          value={metersUsed}
          onChange={(e) => setMetersUsed(e.target.value)}
        />

        <input
          type="date"
          className="input mb-4 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
        />

        {/* ADVANCE */}
        <input
          type="number"
          className="input mb-3 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 placeholder:text-slate-400"
          placeholder="Advance Payment (optional)"
          value={advance}
          onChange={(e) => setAdvance(e.target.value)}
        />

        <select
          className="input mb-6 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
        </select>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading || !customerId}
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:bg-black dark:hover:bg-slate-200 disabled:opacity-60 shadow-lg shadow-slate-900/20 dark:shadow-none transition"
          >
            {loading ? "Saving..." : "Create Order"}
          </button>
        </div>

      </div>
    </div>
  );
}
