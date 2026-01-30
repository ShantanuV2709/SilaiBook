import { useState, useEffect } from "react";
import { fetchCustomers } from "../../api/customers";

export default function SendMessageModal({ onClose }) {
    const [customers, setCustomers] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // Load customers for selection
    useEffect(() => {
        (async () => {
            try {
                const data = await fetchCustomers();
                setCustomers(data);
            } catch (err) {
                console.error("Failed to load customers", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const getSelectedCustomer = () => customers.find(c => c._id === selectedId);

    const sendWhatsApp = () => {
        const customer = getSelectedCustomer();
        if (!customer) return;

        // Format mobile number
        let mobile = customer.mobile || "";
        mobile = mobile.replace(/\D/g, "");
        if (mobile.length === 10) {
            mobile = "91" + mobile;
        }

        const encodedMsg = encodeURIComponent(message);
        const url = `https://wa.me/${mobile}?text=${encodedMsg}`;
        window.open(url, "_blank");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                    Send Message
                </h2>

                {/* CUSTOMER SELECT */}
                <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Select Customer
                    </label>
                    <select
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">-- Choose a customer --</option>
                        {customers.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name} ({c.mobile})
                            </option>
                        ))}
                    </select>
                </div>

                {/* MESSAGE BOX */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Message
                    </label>
                    <textarea
                        className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-white resize-none outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 font-medium"
                        placeholder="Type your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    {/* Quick Templates */}
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-thin">
                        {[
                            "Payment Reminder",
                            "Order Ready",
                            "Shop Closed"
                        ].map(type => (
                            <button
                                key={type}
                                onClick={() => {
                                    if (type === "Payment Reminder") setMessage("Hello, this is a gentle reminder regarding your pending payment at SilaiBook. Please clear it at your earliest convenience.");
                                    if (type === "Order Ready") setMessage("Hello! Your order is ready for pickup at SilaiBook. Please visit us to collect it.");
                                    if (type === "Shop Closed") setMessage("Notice: The shop will remain closed tomorrow due to urgent work. Sorry for the inconvenience.");
                                }}
                                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 whitespace-nowrap transition"
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={sendWhatsApp}
                    disabled={!selectedId || !message}
                    className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                >
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Send WhatsApp
                </button>
            </div>
        </div>
    );
}
