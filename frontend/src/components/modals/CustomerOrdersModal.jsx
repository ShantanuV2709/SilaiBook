import { useEffect, useState } from "react";
import { fetchOrders } from "../../api/orders";

export default function CustomerOrdersModal({ customer, onClose }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customer?._id) {
            loadHistory();
        }
    }, [customer]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await fetchOrders(customer._id);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load order history:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "-";

    const getStatusColor = (status) => {
        switch (status) {
            case "Received":
                return "bg-slate-100 text-slate-700";
            case "Cutting":
                return "bg-amber-100 text-amber-800";
            case "Stitching":
                return "bg-blue-100 text-blue-800";
            case "Finishing":
                return "bg-purple-100 text-purple-800";
            case "Ready":
                return "bg-green-100 text-green-800";
            case "Delivered":
                return "bg-emerald-100 text-emerald-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-2xl relative max-h-[90vh] flex flex-col shadow-2xl">
                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-black mb-1 text-slate-900 dark:text-white">Order History</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                    {customer.name} ({customer.mobile})
                </p>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                    {loading ? (
                        <p className="text-slate-400 dark:text-slate-500 py-10 text-center">Loading history...</p>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No past orders found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                            <p className="font-bold text-lg mt-2 text-slate-900 dark:text-white">
                                                {order.order_type}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                {order.order_number}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-xl text-slate-900 dark:text-white">
                                                ₹ {order.price || 0}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Delivery: {formatDate(order.delivery_date)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ITEMS */}
                                    {order.cloth_used?.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                                Cloth Used
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {order.cloth_used.map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300"
                                                    >
                                                        {item.meters_used}m
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-black dark:hover:bg-slate-200 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
