import { useEffect, useState, Fragment } from "react";
import {
  fetchPaymentSummary,
  fetchCustomerPayments,
} from "../api/payments";
import AddPaymentModal from "../components/modals/AddPaymentModal";

export default function Payments() {
  /* ===================== */
  /* STATE */
  /* ===================== */
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(null);
  const [history, setHistory] = useState({});

  const [showAddPayment, setShowAddPayment] = useState(false);

  /* ===================== */
  /* LOAD SUMMARY */
  /* ===================== */
  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentSummary();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Payment summary error:", err);
      setPayments([]);
    }
    setLoading(false);
  };

  /* ===================== */
  /* TOGGLE HISTORY */
  /* ===================== */
  const toggleExpand = async (customerId) => {
    if (expanded === customerId) {
      setExpanded(null);
      return;
    }

    setExpanded(customerId);

    // mark as loading
    setHistory((prev) => ({
      ...prev,
      [customerId]: undefined,
    }));

    try {
      const data = await fetchCustomerPayments(customerId);
      setHistory((prev) => ({
        ...prev,
        [customerId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error("Payment history error:", err);
      setHistory((prev) => ({
        ...prev,
        [customerId]: [],
      }));
    }
  };

  /* ===================== */
  /* FILTER */
  /* ===================== */
  const filtered = Array.isArray(payments)
    ? payments.filter((p) =>
        (p.customer_name || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : [];

  /* ===================== */
  /* HELPERS */
  /* ===================== */
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const getDueStatus = (dueDate, remaining) => {
    if (!dueDate || remaining <= 0) return null;

    const today = new Date();
    const due = new Date(dueDate);

    if (due < today) return "Overdue";
    if (due.toDateString() === today.toDateString()) return "Due Today";
    return "Upcoming";
  };

  /* ===================== */
  /* UI */
  /* ===================== */
  return (
    <div className="min-h-screen bg-[#eef2ee]">
      <div className="max-w-7xl mx-auto px-10 py-10 space-y-6">

        {/* HEADER */}
        <h1 className="text-3xl font-black text-slate-900">
          Payment Management
        </h1>

        {/* SEARCH + ADD */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <input
            className="w-full md:w-96 px-4 py-3 rounded-xl border border-slate-300"
            placeholder="Search by customer name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => setShowAddPayment(true)}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black transition"
          >
            + Add Payment
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200">
          {loading ? (
            <p className="p-6 text-slate-500">Loading payments…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-slate-500">No payments found</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="p-4">Customer</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => {
                  const dueStatus = getDueStatus(
                    c.due_date,
                    c.remaining_amount
                  );

                  const customerHistory = history[c.customer_id];

                  return (
                    <Fragment key={c.customer_id}>
                      {/* SUMMARY ROW */}
                      <tr className="border-t hover:bg-slate-50">
                        <td className="p-4 font-semibold">
                          {c.customer_name}
                        </td>

                        <td>₹ {c.total_bill}</td>
                        <td>₹ {c.paid_amount}</td>

                        <td
                          className={
                            c.remaining_amount > 0
                              ? "text-red-600 font-bold"
                              : ""
                          }
                        >
                          ₹ {c.remaining_amount}
                        </td>

                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              c.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td>
                          {dueStatus && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                dueStatus === "Overdue"
                                  ? "bg-red-100 text-red-700"
                                  : dueStatus === "Due Today"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {dueStatus}
                            </span>
                          )}
                        </td>

                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() => toggleExpand(c.customer_id)}
                            className="px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-900"
                          >
                            {expanded === c.customer_id ? "Hide" : "View"}
                          </button>

                          {c.status !== "Paid" && (
                            <button
                              className="px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-900"
                              onClick={() =>
                                alert("Payment reminder coming next")
                              }
                            >
                              Reminder
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* HISTORY */}
                      {expanded === c.customer_id && (
                        <tr className="bg-slate-50">
                          <td colSpan="7" className="p-6">
                            <p className="font-bold mb-3">
                              Payment History
                            </p>

                            {customerHistory === undefined && (
                              <p className="text-slate-500">
                                Loading payment history…
                              </p>
                            )}

                            {Array.isArray(customerHistory) &&
                              customerHistory.length === 0 && (
                                <p className="text-slate-500">
                                  No payment history
                                </p>
                              )}

                            {Array.isArray(customerHistory) &&
                              customerHistory.length > 0 && (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-slate-500">
                                      <th>Date</th>
                                      <th>Paid</th>
                                      <th>Mode</th>
                                      <th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {customerHistory.map((p) => (
                                      <tr key={p._id} className="border-t">
                                        <td>
                                          {formatDate(p.created_at)}
                                        </td>
                                        <td>₹ {p.paid_amount}</td>
                                        <td>{p.payment_mode || "-"}</td>
                                        <td>{p.status}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD PAYMENT MODAL */}
      {showAddPayment && (
        <AddPaymentModal
          onClose={() => setShowAddPayment(false)}
          onSuccess={() => {
            setShowAddPayment(false);
            loadPayments();
          }}
        />
      )}
    </div>
  );
}
