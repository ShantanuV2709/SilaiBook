import { useEffect, useState, Fragment } from "react";
import {
  fetchPaymentSummary,
  fetchCustomerPayments,
  deletePayment,
} from "../api/payments";
import AddPaymentModal from "../components/modals/AddPaymentModal";
import PaymentReminderModal from "../components/modals/PaymentReminderModal";
import api from "../api/api"; // Assuming 'api' is imported from somewhere, adding it here for completeness based on the snippet.

export default function Payments() {
  /* ===================== */
  /* STATE */
  /* ===================== */
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [reminderCustomer, setReminderCustomer] = useState(null);
  const [totalPending, setTotalPending] = useState(0);

  const [expanded, setExpanded] = useState(null);
  const [history, setHistory] = useState({});

  /* ===================== */
  /* LOAD DATA */
  /* ===================== */
  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // 1. Load Customer Summary (Main Table)
      try {
        const res = await api.get("/payments/customer-summary");
        setPayments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load payment summary:", err);
        setPayments([]);
      }

      // 2. Load Pending Amount (Stat)
      try {
        const pendingRes = await api.get("/dashboard/pending-amount");
        setTotalPending(pendingRes.data.pending_amount || 0);
      } catch (err) {
        console.error("Failed to load pending amount:", err);
        setTotalPending(0);
      }

    } catch (err) {
      console.error("Critical error loading payments page:", err);
    } finally {
      setLoading(false);
    }
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

  const handleRemovePayment = async (paymentId, customerId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      await deletePayment(paymentId);
      // Refresh history & summary
      const data = await fetchCustomerPayments(customerId);
      setHistory(prev => ({
        ...prev,
        [customerId]: Array.isArray(data) ? data : [],
      }));
      loadPayments(); // refresh main table summaries
    } catch (err) {
      console.error("Failed to delete payment:", err);
      alert("Failed to delete payment");
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
    <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-6">

        {/* HEADER */}
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Payment Management
        </h1>

        {/* SEARCH + ADD */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <input
            className="w-full md:w-96 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500"
            placeholder="Search by customer name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => setShowAddPayment(true)}
            className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-black dark:hover:bg-slate-200 transition"
          >
            + Add Payment
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Collected - Green */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-6 border-2 border-green-200 dark:border-green-800 shadow-lg">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Total Collected</p>
            <p className="text-3xl font-black text-green-900 dark:text-green-100">
              ₹ {payments.reduce((sum, p) => sum + (p.paid_amount || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-2 flex items-center gap-1">
              <span className="text-lg">↗</span> Received
            </p>
          </div>

          {/* Pending to Collect - Amber */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Pending to Collect</p>
            <p className="text-3xl font-black text-amber-900 dark:text-amber-100">
              ₹ {payments.reduce((sum, p) => sum + (p.remaining_amount || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">Outstanding Dues</p>
          </div>

          {/* Recent Transactions - Violet */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-3xl p-6 border-2 border-violet-200 dark:border-violet-800 shadow-lg">
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-400 mb-2">Transactions</p>
            <p className="text-3xl font-black text-violet-900 dark:text-violet-100">{payments.length}</p>
            <p className="text-xs text-violet-600 dark:text-violet-500 mt-2">Recorded Payments</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden overflow-x-auto border border-slate-200 dark:border-slate-700">
          {loading ? (
            <p className="p-6 text-slate-500 dark:text-slate-400">Loading payments…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-slate-500 dark:text-slate-400">No payments found</p>
          ) : (
            <table className="w-full text-slate-600 dark:text-slate-300 min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30">
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
                      <tr className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition">
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          {c.customer_name}
                        </td>

                        <td>₹ {c.total_bill}</td>
                        <td>₹ {c.paid_amount}</td>

                        <td
                          className={
                            c.remaining_amount > 0
                              ? "text-red-600 dark:text-red-400 font-bold"
                              : ""
                          }
                        >
                          ₹ {c.remaining_amount}
                        </td>

                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${c.status === "Paid"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                              }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td>
                          {dueStatus && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${dueStatus === "Overdue"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                : dueStatus === "Due Today"
                                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                }`}
                            >
                              {dueStatus}
                            </span>
                          )}
                        </td>

                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() => toggleExpand(c.customer_id)}
                            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-white transition"
                          >
                            {expanded === c.customer_id ? "Hide History" : "View History"}
                          </button>

                          {c.status !== "Paid" && (
                            <button
                              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-white transition"
                              onClick={() =>
                                setReminderCustomer(c)
                              }
                            >
                              Reminder
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* HISTORY */}
                      {expanded === c.customer_id && (
                        <tr className="bg-slate-50 dark:bg-slate-700/30">
                          <td colSpan="7" className="p-6">
                            <p className="font-bold mb-3 text-slate-900 dark:text-white">
                              Payment History
                            </p>

                            {customerHistory === undefined && (
                              <p className="text-slate-500 dark:text-slate-400">
                                Loading payment history…
                              </p>
                            )}

                            {Array.isArray(customerHistory) &&
                              customerHistory.length === 0 && (
                                <p className="text-slate-500 dark:text-slate-400">
                                  No payment history
                                </p>
                              )}

                            {Array.isArray(customerHistory) &&
                              customerHistory.length > 0 && (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-600">
                                      <th className="pb-2">Date</th>
                                      <th className="pb-2">Paid</th>
                                      <th className="pb-2">Mode</th>
                                      <th className="pb-2">Status</th>
                                      <th className="pb-2"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {customerHistory.map((p) => (
                                      <tr key={p._id} className="border-t border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                                        <td className="py-2">
                                          {formatDate(p.created_at)}
                                        </td>
                                        <td className="py-2">₹ {p.paid_amount}</td>
                                        <td className="py-2">{p.payment_mode || "-"}</td>
                                        <td className="py-2">{p.status}</td>
                                        <td className="w-10 py-2">
                                          <button
                                            onClick={() => handleRemovePayment(p._id, c.customer_id)}
                                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold px-2"
                                            title="Delete Payment"
                                          >
                                            ✕
                                          </button>
                                        </td>
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

      {/* REMINDER MODAL */}
      {reminderCustomer && (
        <PaymentReminderModal
          customer={reminderCustomer}
          onClose={() => setReminderCustomer(null)}
        />
      )}
    </div>
  );
}
