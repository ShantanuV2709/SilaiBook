import { useEffect, useState } from "react";
import api from "../api/api";
import AddOrderModal from "../components/modals/AddOrderModal";

const STATUSES = [
  "Received",
  "Cutting",
  "Stitching",
  "Finishing",
  "Ready",
  "Delivered",
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    api
      .get("/orders")
      .then(res => setOrders(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, null, {
      params: { status },
    });
    loadOrders();
  };

  const isOverdue = (order) => {
    if (order.status === "Delivered") return false;
    return new Date(order.delivery_date) < new Date();
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black">Orders</h1>

        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary"
        >
          + Add Order
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Delivery</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  Loading orders...
                </td>
              </tr>
            )}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  No orders found
                </td>
              </tr>
            )}

            {orders.map(order => (
              <tr
                key={order._id}
                className={`border-t ${
                  isOverdue(order) ? "bg-red-50" : ""
                }`}
              >
                <td className="p-3 font-medium">
                  {order.order_number}
                </td>

                <td className="p-3">
                  <div>{order.customer_name}</div>
                  <div className="text-xs text-slate-500">
                    {order.customer_mobile}
                  </div>
                </td>

                <td className="p-3">
                  {order.order_type}
                </td>

                <td className="p-3">
                  {order.delivery_date}
                  {isOverdue(order) && (
                    <div className="text-xs text-red-600 font-semibold">
                      Overdue
                    </div>
                  )}
                </td>

                <td className="p-3">
                  <select
                    className="input"
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(order._id, e.target.value)
                    }
                  >
                    {STATUSES.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <AddOrderModal
          onClose={() => setShowAdd(false)}
          onSuccess={loadOrders}
        />
      )}
    </div>
  );
}
