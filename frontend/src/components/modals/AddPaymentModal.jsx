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

    // PARTIAL → lock bill, limit payment
    if (c.status === "Partial") {
      setTotalBill(c.total_bill);
      setMaxPayable(c.remaining_amount);
      return;
    }

    // UNPAID → allow full bill entry
    if (c.status === "Unpaid") {
      setTotalBill("");
      setMaxPayable(null);
      return;
    }

    // PAID → block
    setTotalBill(c.total_bill);
    setMaxPayable(0);
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

    if (!totalBill) return;

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black mb-6">
          Add Payment
        </h2>

        {/* CUSTOMER */}
        <select
          className="input mb-4"
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
          className="input mb-2"
          placeholder="Total Bill"
          value={totalBill}
          disabled={selected?.status === "Partial" || selected?.status === "Paid"}
          onChange={(e) => setTotalBill(e.target.value)}
        />

        <input
          type="date"
          className="input mb-4"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />


        {/* REMAINING */}
        {selected?.status === "Partial" && (
          <p className="text-sm text-slate-500 mb-3">
            Remaining: ₹ {selected.remaining_amount}
          </p>
        )}

        {/* PAID AMOUNT */}
        <input
          type="number"
          className="input mb-4"
          placeholder={
            maxPayable !== null
              ? `Max ₹ ${maxPayable}`
              : "Paid Amount"
          }
          value={paidAmount}
          onChange={(e) => onPaidChange(e.target.value)}
          disabled={selected?.status === "Paid"}
        />

        {/* MODE */}
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
            disabled={
              !selected ||
              selected.status === "Paid" ||
              !paidAmount ||
              paidAmount <= 0
            }
            className="btn-primary"
          >
            Save Payment
          </button>
        </div>

      </div>
    </div>
  );
}
