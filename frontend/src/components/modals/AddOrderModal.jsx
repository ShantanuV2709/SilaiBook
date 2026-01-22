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
    if (!customerId || !deliveryDate || !metersUsed) return;

    setLoading(true);

    try {
      // 1️⃣ Create order
      const orderRes = await api.post("/orders/", {
        customer_id: customerId,
        order_type: orderType,
        measurements: measurements || {},
        cloth_items: [
          {
            cloth_stock_id: clothId,
            meters_used: Number(metersUsed),
          },
        ],
        delivery_date: deliveryDate,
        priority: "Normal",
      });


      // 2️⃣ Advance payment (optional)
      if (advance && Number(advance) > 0) {
        await api.post("/payments", {
          customer_id: customerId,
          total_bill: Number(advance),
          paid_amount: Number(advance),
          payment_mode: paymentMode,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add order");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== */
  /* UI */
  /* ===================== */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-6">
          Add Order
        </h2>

        {/* CUSTOMER */}
        <select
          className="input mb-4"
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
          className="input mb-4"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option>Shirt</option>
          <option>Pant</option>
          <option>Suit</option>
          <option>Blouse</option>
          <option>Custom</option>
        </select>

        {/* MEASUREMENTS PREVIEW */}
        {measurements && Object.keys(measurements).length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 text-xs mb-4">
            <p className="font-semibold mb-1">Measurements</p>
            <pre>{JSON.stringify(measurements, null, 2)}</pre>
          </div>
        )}


        {/* CLOTH */}
        <select
          className="input mb-3"
          value={clothId}
          onChange={(e) => setClothId(e.target.value)}
        >
          <option value="">Select Cloth</option>
          {clothStock.map(c => (
            <option key={c._id} value={c._id}>
              {c.cloth_type} – {c.remaining_meters}m
            </option>
          ))}
        </select>

        <input
          type="number"
          className="input mb-4"
          placeholder="Meters Used"
          value={metersUsed}
          onChange={(e) => setMetersUsed(e.target.value)}
        />

        <input
          type="date"
          className="input mb-4"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
        />

        {/* ADVANCE */}
        <input
          type="number"
          className="input mb-3"
          placeholder="Advance Payment (optional)"
          value={advance}
          onChange={(e) => setAdvance(e.target.value)}
        />

        <select
          className="input mb-6"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
        </select>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-gray">
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading || !customerId}
            className="btn-primary"
          >
            {loading ? "Saving..." : "Create Order"}
          </button>
        </div>

      </div>
    </div>
  );
}
