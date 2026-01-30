import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function Invoice() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/orders/${id}`)
            .then(res => setOrder(res.data))
            .catch(err => alert("Failed to load order"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading Invoice...</div>;
    if (!order) return <div className="p-10 text-center text-red-500">Order not found</div>;

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen p-8 text-slate-900 dark:text-white font-sans print:p-0 print:bg-white print:text-black">

            {/* PRINT CONTROLS - HIDDEN WHEN PRINTING */}
            <div className="max-w-3xl mx-auto mb-8 print:hidden flex justify-between items-center">
                <button
                    onClick={() => window.history.back()}
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                >
                    ← Back
                </button>
                <button
                    onClick={() => window.print()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                >
                    🖨️ Print / Save PDF
                </button>
            </div>

            {/* INVOICE PAPER */}
            <div className="bg-white dark:bg-slate-800 max-w-3xl mx-auto border border-slate-200 dark:border-slate-700 p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none print:shadow-none print:border-none print:p-0 print:bg-white print:text-black text-slate-900 dark:text-white">

                {/* HEADER */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-900 dark:text-white print:text-black">SILAI<span className="text-indigo-600 print:text-black">BOOK</span></h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium print:text-slate-600">Professional Tailoring Services</p>
                        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 print:text-slate-600">
                            <p>123 Fashion Street, Market Road</p>
                            <p>City, State, 400001</p>
                            <p>+91 98765 43210</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1 print:text-slate-400">Invoice</h2>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white print:text-black">#{order.order_number}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 print:text-slate-600">
                            Date: {new Date(order.created_at || Date.now()).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* CUSTOMER INFO */}
                <div className="border-t border-b border-slate-100 dark:border-slate-700 py-8 mb-8 flex justify-between print:border-slate-200">
                    <div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 print:text-slate-500">Billed To</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white print:text-black">{order.customer_name}</p>
                        <p className="text-slate-600 dark:text-slate-400 print:text-slate-600">{order.customer_mobile}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 print:text-slate-500">Due Date</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white print:text-black">{new Date(order.delivery_date).toLocaleDateString()}</p>
                        <div className="mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 print:bg-green-100 print:text-green-700' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 print:bg-amber-100 print:text-amber-700'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* LINE ITEMS */}
                <table className="w-full mb-8">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 print:bg-slate-50 print:border-slate-200">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase print:text-slate-600">Item Description</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase print:text-slate-600">Measurements / Notes</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase print:text-slate-600">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-4 px-4 align-top font-bold text-lg text-slate-900 dark:text-white print:text-black">{order.order_type}</td>
                            <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-sm print:text-slate-600">
                                {order.measurements ? (
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        {Object.entries(order.measurements).map(([k, v]) => (
                                            <span key={k}><span className="font-semibold capitalize">{k}:</span> {v}</span>
                                        ))}
                                    </div>
                                ) : "Standard Stitching"}
                                {order.special_instructions && (
                                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded border border-yellow-100 dark:border-yellow-900/50 print:bg-yellow-50 print:text-yellow-800 print:border-yellow-100">
                                        Note: {order.special_instructions}
                                    </div>
                                )}
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-lg text-slate-900 dark:text-white print:text-black">₹ {order.price || 0}</td>
                        </tr>
                        {/* Placeholder for fabric costs etc if we had them */}
                    </tbody>
                </table>

                {/* TOTALS */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-600">
                            <span>Subtotal</span>
                            <span>₹ {order.price || 0}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-600">
                            <span>Advance Paid</span>
                            <span className="text-green-600 dark:text-green-400 print:text-green-600">- ₹ {order.advance_amount || 0}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center print:border-slate-200">
                            <span className="font-bold text-lg text-slate-900 dark:text-white print:text-black">Total Due</span>
                            <span className="font-black text-2xl text-slate-900 dark:text-white print:text-black">
                                ₹ {Math.max(0, (order.price || 0) - (order.advance_amount || 0))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="text-center text-slate-400 dark:text-slate-500 text-xs border-t border-slate-100 dark:border-slate-800 pt-8 print:border-slate-100 print:text-slate-400">
                    <p className="mb-1">Thank you for choosing SilaiBook!</p>
                    <p>Terms & Conditions: no returns after 7 days. Alterations free within 2 weeks.</p>
                </div>

            </div>

        </div>
    );
}
