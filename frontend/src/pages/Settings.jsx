import { useState, useEffect } from "react";

// Default templates
const DEFAULTS = {
    order_ready: "Hello {customer_name}, Your order #{order_id} is ready at SilaiBook. Total: ₹{amount}. Pending Due: ₹{pending}. Please pickup soon!",
    payment_due: "Hello {customer_name}, This is a reminder that you have a pending balance of ₹{amount} at SilaiBook. Please clear it at your earliest convenience.",
    shop_closed: "Notice: SilaiBook will remain closed on {date} due to {reason}. Sorry for the inconvenience."
};

export default function Settings() {
    const [templates, setTemplates] = useState(DEFAULTS);

    // In a real app, we'd fetch this from backend. 
    // For now, let's persist to localStorage so it survives refreshes.
    useEffect(() => {
        const saved = localStorage.getItem("msg_templates");
        if (saved) {
            setTemplates(JSON.parse(saved));
        }
    }, []);

    const saveTemplates = () => {
        localStorage.setItem("msg_templates", JSON.stringify(templates));
        alert("Templates saved successfully!");
    };

    const updateTemplate = (key, val) => {
        setTemplates(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] px-4 md:px-10 py-6 md:py-10 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Settings</h1>
                        <p className="text-slate-600 dark:text-slate-400">Manage message templates and shop preferences.</p>
                    </div>
                    <button
                        onClick={saveTemplates}
                        className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-black dark:hover:bg-slate-200 transition shadow-lg shadow-slate-900/20 dark:shadow-none"
                    >
                        Save Changes
                    </button>
                </div>

                {/* MESSAGE TEMPLATES SECTION */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        💬 WhatsApp Message Templates
                    </h2>

                    <div className="space-y-6">

                        {/* Order Ready */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Order Ready Message</label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Variables: {`{customer_name}, {order_id}, {amount}, {pending}`}</p>
                            <textarea
                                className="w-full h-24 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={templates.order_ready}
                                onChange={e => updateTemplate("order_ready", e.target.value)}
                            />
                        </div>

                        {/* Payment Due */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Payment Reminder Message</label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Variables: {`{customer_name}, {amount}`}</p>
                            <textarea
                                className="w-full h-24 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={templates.payment_due}
                                onChange={e => updateTemplate("payment_due", e.target.value)}
                            />
                        </div>

                        {/* Shop Closed */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Shop Closed / Holiday Notice</label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Variables: {`{date}, {reason}`}</p>
                            <textarea
                                className="w-full h-24 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={templates.shop_closed}
                                onChange={e => updateTemplate("shop_closed", e.target.value)}
                            />
                        </div>

                    </div>
                </div>

                {/* APP INFO */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 border border-slate-700">
                    <h2 className="text-xl font-bold mb-2">SilaiBook v1.0</h2>
                    <p className="text-slate-400 text-sm">
                        Designed for professional tailoring management. <br />
                        &copy; 2026 SilaiBook. All rights reserved.
                    </p>
                </div>

            </div>
        </div>
    );
}
