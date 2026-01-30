import { useState, useEffect } from "react";
import { fetchOwners, createOwner, recordWithdrawal, recordDeposit, deleteOwner } from "../api/owners";

export default function Owners() {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'add', 'withdraw', 'deposit'

    // Forms
    const [addForm, setAddForm] = useState({ name: "", role: "Partner", share_percentage: "" });
    const [transactionForm, setTransactionForm] = useState({ ownerId: "", amount: "", note: "" });

    useEffect(() => {
        loadOwners();
    }, []);

    const loadOwners = async () => {
        setLoading(true);
        try {
            const data = await fetchOwners();
            setOwners(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOwner = async () => {
        if (!addForm.name) return;
        try {
            await createOwner(addForm);
            setAddForm({ name: "", role: "Partner", share_percentage: "" });
            setActiveModal(null);
            loadOwners();
        } catch (err) {
            alert("Failed to add partner");
        }
    };

    const handleTransaction = async () => {
        if (!transactionForm.amount || !transactionForm.ownerId) return;
        try {
            if (activeModal === 'withdraw') {
                await recordWithdrawal(transactionForm.ownerId, Number(transactionForm.amount), transactionForm.note);
            } else {
                await recordDeposit(transactionForm.ownerId, Number(transactionForm.amount), transactionForm.note);
            }
            setTransactionForm({ ownerId: "", amount: "", note: "" });
            setActiveModal(null);
            loadOwners();
        } catch (err) {
            alert("Transaction failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will deactivate the partner.")) return;
        await deleteOwner(id);
        loadOwners();
    }

    const openTransactionModal = (type, ownerId) => {
        setTransactionForm({ ownerId, amount: "", note: "" });
        setActiveModal(type);
    };

    return (
        <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] px-4 md:px-10 py-6 md:py-10 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Partners & Owners</h1>
                        <p className="text-slate-600 dark:text-slate-400">Manage business partners and track withdrawals.</p>
                    </div>
                    <button
                        onClick={() => setActiveModal("add")}
                        className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-black dark:hover:bg-slate-200 transition shadow-lg shadow-slate-900/20 dark:shadow-none"
                    >
                        + Add Partner
                    </button>
                </div>

                {/* OWNERS GRID */}
                {loading ? (
                    <p className="text-slate-400">Loading partners...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {owners.map(owner => (
                            <div key={owner._id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:scale-[1.01] transition duration-300 relative group">

                                {/* ROLE TAG */}
                                <span className="absolute top-6 right-6 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide rounded-full">
                                    {owner.role}
                                </span>

                                {/* INFO */}
                                <div className="mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-2xl mb-4 font-black text-slate-400 dark:text-slate-300">
                                        {owner.name[0]}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{owner.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Share: {owner.share_percentage}%</p>
                                </div>

                                {/* STATS */}
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Withdrawn</p>
                                    <p className={`text-2xl font-black ${owner.total_withdrawn > 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                        ₹ {owner.total_withdrawn?.toLocaleString() || 0}
                                    </p>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openTransactionModal("withdraw", owner._id)}
                                        className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-black dark:hover:bg-slate-200 transition"
                                    >
                                        Withdraw
                                    </button>
                                    <button
                                        onClick={() => openTransactionModal("deposit", owner._id)}
                                        className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition"
                                    >
                                        Deposit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(owner._id)}
                                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-400 transition"
                                    >
                                        ✕
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

                {/* MODALS */}
                {activeModal === "add" && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
                            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Add New Partner</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                    <input
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        value={addForm.name}
                                        onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        value={addForm.role}
                                        onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                                    >
                                        <option>Partner</option>
                                        <option>Investor</option>
                                        <option>Manager</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Share Percentage (%)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        value={addForm.share_percentage}
                                        onChange={e => setAddForm({ ...addForm, share_percentage: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={handleAddOwner}
                                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 mt-2"
                                >
                                    Create Profile
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full py-3 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {(activeModal === "withdraw" || activeModal === "deposit") && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
                            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                                {activeModal === 'withdraw' ? 'Record Withdrawal' : 'Record Deposit'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        autoFocus
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xl font-bold text-slate-900 dark:text-white"
                                        value={transactionForm.amount}
                                        onChange={e => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Note (Optional)</label>
                                    <input
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="e.g. Personal expense"
                                        value={transactionForm.note}
                                        onChange={e => setTransactionForm({ ...transactionForm, note: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={handleTransaction}
                                    className={`w-full py-3 text-white font-bold rounded-xl mt-2 ${activeModal === 'withdraw'
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    Confirm {activeModal === 'withdraw' ? 'Withdrawal' : 'Deposit'}
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full py-3 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
