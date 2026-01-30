import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import AddOrderModal from "../components/modals/AddOrderModal";
import ConfirmReadyModal from "../components/modals/ConfirmReadyModal";

import OrderMessageModal from "../components/modals/OrderMessageModal"; // Import new modal

/**
 * Status flow:
 * - READY is excluded from dropdown
 * - READY is only reachable via confirmation modal
 * - READY → DELIVERED allowed via dropdown
 */
const STATUSES = [
  "Received",
  "Cutting",
  "Stitching",
  "Finishing",
  "Delivered",
];

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showReadyConfirm, setShowReadyConfirm] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false); // New state
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* ===================== */
  /* LOAD ORDERS */
  /* ===================== */
  const loadOrders = () => {
    setLoading(true);
    api
      .get("/orders")
      .then((res) => setOrders(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ===================== */
  /* STATUS UPDATE (NON-READY) */
  /* ===================== */
  const updateStatus = async (order, nextStatus) => {
    if (nextStatus === order.status) return;

    await api.put(`/orders/${order._id}/status`, null, {
      params: { status: nextStatus },
    });

    loadOrders();
  };

  /* ===================== */
  /* CONFIRM READY */
  /* ===================== */
  /* ===================== */
  /* CONFIRM READY */
  /* ===================== */
  const confirmReady = async () => {
    try {
      await api.post(
        `/orders/${selectedOrder._id}/mark-ready`,
        null,
        { params: { confirm: true } }
      );

      // 🔔 AUTO-MESSAGE PROMPT
      let templates = JSON.parse(localStorage.getItem("msg_templates") || "{}");

      // Fallback default if not set
      if (!templates.order_ready) {
        templates.order_ready = "Hello {customer_name}, Your order #{order_id} is ready at SilaiBook. Total: ₹{amount}. Pending Due: ₹{pending}. Please pickup soon!";
      }

      if (templates.order_ready) {
        if (window.confirm("Order marked as Ready. Send WhatsApp notification to customer?")) {
          const price = selectedOrder.price || 0;
          const advance = selectedOrder.advance_amount || 0;
          const pending = Math.max(0, price - advance);

          let msg = templates.order_ready
            .replace("{customer_name}", selectedOrder.customer_name || "Customer")
            .replace("{order_id}", selectedOrder.order_number)
            .replace("{amount}", price)
            .replace("{pending}", pending);

          let mobile = selectedOrder.customer_mobile || "";


          mobile = mobile.replace(/\D/g, "");
          if (mobile.length === 10) mobile = "91" + mobile;

          const url = `https://wa.me/${mobile}?text=${encodeURIComponent(msg)}`;
          window.open(url, "_blank");
        }
      }

      setShowReadyConfirm(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      alert("Failed to mark order as Ready");
    }
  };

  /* ===================== */
  /* HELPERS */
  /* ===================== */
  const isOverdue = (order) => {
    if (order.status === "Delivered") return false;
    return new Date(order.delivery_date) < new Date();
  };

  const canMarkReady = (order) =>
    order.status === "Finishing" && order.cloth_used?.length > 0;

  /* ===================== */
  /* UI */
  /* ===================== */
  return (
    <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Orders</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-xl border border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold hover:bg-black dark:hover:bg-slate-200 transition"
          >
            + Add Order
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Orders - Blue */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20 rounded-3xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Total Orders</p>
            <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{orders.length}</p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">All Time</p>
          </div>

          {/* Pending - Amber */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/20 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Pending / Active</p>
            <p className="text-3xl font-black text-amber-900 dark:text-amber-100">
              {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">In Progress</p>
          </div>

          {/* Ready - Teal */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/20 rounded-3xl p-6 border-2 border-teal-200 dark:border-teal-800 shadow-lg">
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-2">Ready to Deliver</p>
            <p className="text-3xl font-black text-teal-900 dark:text-teal-100">
              {orders.filter(o => o.status === 'Ready').length}
            </p>
            <p className="text-xs text-teal-600 dark:text-teal-500 mt-2">Completed</p>
          </div>

          {/* Delivered - Green */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20 rounded-3xl p-6 border-2 border-green-200 dark:border-green-800 shadow-lg">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Delivered</p>
            <p className="text-3xl font-black text-green-900 dark:text-green-100">
              {orders.filter(o => o.status === 'Delivered').length}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-2 flex items-center gap-1">
              <span className="text-lg">✓</span> Success
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-slate-100 dark:bg-slate-700/50">
              <tr>
                <th className="p-3 text-left text-slate-500 dark:text-slate-400">Order</th>
                <th className="p-3 text-left text-slate-500 dark:text-slate-400">Customer</th>
                <th className="p-3 text-left text-slate-500 dark:text-slate-400">Type</th>
                <th className="p-3 text-left text-slate-500 dark:text-slate-400">Delivery</th>
                <th className="p-3 text-left text-slate-500 dark:text-slate-400">Status</th>
                <th className="p-3 text-left text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-500">
                    No orders found
                  </td>
                </tr>
              )}

              {orders.map((order) => (
                <tr
                  key={order._id}
                  className={`border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isOverdue(order) ? "bg-red-50 dark:bg-red-900/20" : ""
                    }`}
                >
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-200">{order.order_number}</td>

                  <td className="p-3">
                    <div className="text-slate-900 dark:text-slate-200">{order.customer_name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {order.customer_mobile}
                    </div>
                  </td>

                  <td className="p-3 text-slate-700 dark:text-slate-300">{order.order_type}</td>

                  <td className="p-3">
                    <span className="text-slate-700 dark:text-slate-300">{order.delivery_date}</span>
                    {isOverdue(order) && (
                      <div className="text-xs text-red-600 dark:text-red-400 font-semibold">
                        Overdue
                      </div>
                    )}
                  </td>

                  {/* STATUS DROPDOWN */}
                  <td className="p-3">
                    <select
                      className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-3 py-1 text-slate-800 dark:text-slate-200 text-xs"
                      value={order.status}
                      disabled={order.status === "Delivered"}
                      onChange={(e) =>
                        updateStatus(order, e.target.value)
                      }
                    >
                      {/* Always show current status */}
                      <option value={order.status}>
                        {order.status}
                      </option>

                      {/* Allow Delivered only after Ready */}
                      {order.status === "Ready" && (
                        <option value="Delivered">Delivered</option>
                      )}

                      {/* Normal flow (excluding Ready) */}
                      {order.status !== "Ready" &&
                        STATUSES.filter(
                          (s) => s !== order.status
                        ).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </select>
                  </td>

                  {/* ACTION */}
                  <td className="p-3">
                    <button
                      disabled={!canMarkReady(order)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-900 dark:hover:border-slate-400 disabled:opacity-40 transition"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowReadyConfirm(true);
                      }}
                    >
                      Mark Ready
                    </button>
                    <button
                      className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase hover:underline ml-2"
                      onClick={() => navigate(`/invoice/${order._id}`)}
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODALS */}
        {showAdd && (
          <AddOrderModal
            onClose={() => setShowAdd(false)}
            onSuccess={loadOrders}
          />
        )}

        {showReadyConfirm && selectedOrder && (
          <ConfirmReadyModal
            order={selectedOrder}
            onClose={() => {
              setShowReadyConfirm(false);
              setSelectedOrder(null);
            }}
            onConfirm={confirmReady}
          />
        )}

        {showMessageModal && selectedOrder && (
          <OrderMessageModal
            order={selectedOrder}
            onClose={() => {
              setShowMessageModal(false);
              setSelectedOrder(null);
            }}
          />
        )}

      </div>
    </div>
  );
}
