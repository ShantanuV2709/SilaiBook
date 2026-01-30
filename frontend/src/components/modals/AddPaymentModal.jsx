import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AddPaymentModal({ onClose, onSuccess }) {
  /* ===================== */
  /* STATE */
  /* ===================== */
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);

  const [totalBill, setTotalBill] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");

  const [maxPayable, setMaxPayable] = useState(null);
  const [dueDate, setDueDate] = useState("");

  /* ============================= */
  /* LOAD CUSTOMERS + PAYMENT DATA */
  /* ============================= */
  useEffect(() => {
    Promise.all([
      api.get("/customers"),
      api.get("/payments/customer-summary"),
    ])
      .then(([customersRes, paymentsRes]) => {
        const allCustomers = Array.isArray(customersRes.data)
          ? customersRes.data
          : [];

        const summaries = Array.isArray(paymentsRes.data)
          ? paymentsRes.data
          : [];

        const paymentMap = {};
        summaries.forEach(p => {
          paymentMap[p.customer_id] = p;
        });

        const merged = allCustomers.map(c => {
          const p = paymentMap[c._id];

          return {
            customer_id: c._id,
            customer_name: c.name,

            status: p?.status || "Unpaid",
            total_bill: p?.total_bill || "",
            paid_amount: p?.paid_amount || 0,
            remaining_amount:
              typeof p?.remaining_amount === "number"
                ? p.remaining_amount
                : null,
          };
        });

        setCustomers(merged);
      })
      .catch(() => setCustomers([]));
  }, []);

  /* ===================== */
  /* CUSTOMER SELECTION */
  /* ===================== */
  const onCustomerSelect = (customerId) => {
    const c = customers.find(x => x.customer_id === customerId);
    setSelected(c || null);

    setPaidAmount("");

    if (!c) {
      setTotalBill("");
      setMaxPayable(null);
      return;
    }

    // PARTIAL → lock bill (0), limit payment (pay off remainder)
    if (c.status === "Partial") {
      setTotalBill(0); // Don't add to the bill, just paying off
      setMaxPayable(c.remaining_amount);
      return;
    }

    // UNPAID or PAID → allow new bill entry
    setTotalBill("");
    setMaxPayable(null);
  };

  /* ===================== */
  /* PAID AMOUNT HANDLER */
  /* ===================== */
  const onPaidChange = (value) => {
    const amount = Number(value);

    if (amount < 0) return;

    if (maxPayable !== null && amount > maxPayable) {
      setPaidAmount(maxPayable);
      return;
    }

    setPaidAmount(amount);
  };

  /* ===================== */
  /* SUBMIT */
  /* ===================== */
  const submit = async () => {
    if (!selected) return;

    if (!paidAmount || paidAmount <= 0) return;

    if (totalBill === "" || totalBill === null || totalBill === undefined) return;

    await api.post("/payments", {
      customer_id: selected.customer_id,
      total_bill: Number(totalBill),
      paid_amount: Number(paidAmount),
      payment_mode: paymentMode,
      due_date: dueDate || null,
    });

    onSuccess();
    onClose();
  };

  /* ===================== */
  /* UI */
  /* ===================== */
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">
          Add Payment
        </h2>

        {/* CUSTOMER */}
        <select
          className="input mb-4 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          value={selected?.customer_id || ""}
          onChange={(e) => onCustomerSelect(e.target.value)}
        >
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.customer_name} ({c.status})
            </option>
          ))}
        </select>

        {/* TOTAL BILL */}
        <input
          type="number"
          className="input mb-2 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 placeholder:text-slate-400"
          placeholder="Total Bill (New Debt)"
          value={totalBill}
          disabled={selected?.status === "Partial"} // Only lock for finding balance
          onChange={(e) => setTotalBill(e.target.value)}
        />

        <input
          type="date"
          className="input mb-4 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />


        {/* REMAINING */}
        {selected?.status === "Partial" && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Remaining: ₹ {selected.remaining_amount}
          </p>
        )}

        {/* PAID AMOUNT */}
        <input
          type="number"
          className="input mb-4 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 placeholder:text-slate-400"
          placeholder={
            maxPayable !== null
              ? `Max ₹ ${maxPayable}`
              : "Paid Amount"
          }
          value={paidAmount}
          onChange={(e) => onPaidChange(e.target.value)}
        // disabled={selected?.status === "Paid"} // Allow paying in advance/new bill
        />

        {/* MODE */}
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
            disabled={
              !selected ||
              !paidAmount ||
              paidAmount <= 0
            }
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:bg-black dark:hover:bg-slate-200 disabled:opacity-60 shadow-lg shadow-slate-900/20 dark:shadow-none transition"
          >
            Save Payment
          </button>
        </div>

      </div>
    </div>
  );
}
