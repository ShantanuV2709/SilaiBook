import { useState, useEffect } from "react";

export default function PaymentReminderModal({ customer, onClose }) {
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (customer) {
            const defaultMsg = `Hello ${customer.customer_name},

Your total due amount at SilaiBook is ₹ ${customer.remaining_amount}.
Please pay eagerly.

Thank you!
SilaiBook Store`;
            setMessage(defaultMsg);
        }
    }, [customer]);

    const sendWhatsApp = () => {
        // Format mobile number (remove spaces, ensure country code)
        let mobile = customer.customer_mobile || "";
        mobile = mobile.replace(/\D/g, ""); // remove non-digits

        // Add 91 if missing and length is 10
        if (mobile.length === 10) {
            mobile = "91" + mobile;
        }

        const encodedMsg = encodeURIComponent(message);
        const url = `https://wa.me/${mobile}?text=${encodedMsg}`;
        window.open(url, "_blank");
        onClose();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
        alert("Message copied to clipboard!");
    };

    if (!customer) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    Send Reminder
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    To {customer.customer_name} (₹ {customer.remaining_amount} due)
                </p>

                <textarea
                    className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-white resize-none outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 mb-6 font-medium"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <div className="flex flex-col gap-3">
                    <button
                        onClick={sendWhatsApp}
                        className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Send via WhatsApp
                    </button>

                    <button
                        onClick={copyToClipboard}
                        className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                        Copy Message
                    </button>
                </div>
            </div>
        </div>
    );
}
