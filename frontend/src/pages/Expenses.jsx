import { useEffect, useState } from "react";
import { fetchExpenses, addExpense, getTodayExpense, getMonthlySummary } from "../api/expenses";

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [todayTotal, setTodayTotal] = useState(0);
    const [monthlySummary, setMonthlySummary] = useState(null);

    // Filters
    const [filterType, setFilterType] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterPaymentMode, setFilterPaymentMode] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        amount: "",
        category: "Rent",
        expense_type: "SHOP",
        payment_mode: "Cash",
        remarks: "",
    });

    const loadExpenses = async () => {
        try {
            const filters = {};
            if (filterType) filters.expense_type = filterType;
            if (filterCategory) filters.category = filterCategory;
            if (filterPaymentMode) filters.payment_mode = filterPaymentMode;

            const data = await fetchExpenses(filters);
            setExpenses(data);
        } catch (error) {
            console.error("Failed to load expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadTodayExpense = async () => {
        try {
            const data = await getTodayExpense();
            setTodayTotal(data.today_expense || 0);
        } catch (error) {
            console.error("Failed to load today's expense:", error);
        }
    };

    const loadMonthlySummary = async () => {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const data = await getMonthlySummary(year, month);
            setMonthlySummary(data);
        } catch (error) {
            console.error("Failed to load monthly summary:", error);
        }
    };

    useEffect(() => {
        loadExpenses();
        loadTodayExpense();
        loadMonthlySummary();
    }, []);

    useEffect(() => {
        loadExpenses();
    }, [filterType, filterCategory, filterPaymentMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addExpense({
                ...formData,
                amount: parseFloat(formData.amount),
            });
            await loadExpenses();
            await loadTodayExpense();
            await loadMonthlySummary();
            closeModal();
        } catch (error) {
            console.error("Failed to add expense:", error);
            alert("Failed to add expense");
        }
    };

    const openAddModal = () => {
        setFormData({
            amount: "",
            category: "Rent",
            expense_type: "SHOP",
            payment_mode: "Cash",
            remarks: "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const clearFilters = () => {
        setFilterType("");
        setFilterCategory("");
        setFilterPaymentMode("");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#eef2ee] flex items-center justify-center">
                <p className="text-slate-400 font-semibold">Loading expenses…</p>
            </div>
        );
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyTotal = monthlySummary?.breakdown.reduce((sum, item) => sum + item.total, 0) || 0;

    return (
        <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-8">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Expenses</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="rounded-xl border border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 font-semibold hover:bg-black dark:hover:bg-slate-200 transition shadow-lg shadow-slate-900/20 dark:shadow-none"
                    >
                        + Add Expense
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Today's Expense - Red */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/40 dark:to-rose-800/40 rounded-3xl p-6 border-2 border-red-200 dark:border-red-800/50 shadow-lg">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Today's Expense</p>
                        <p className="text-3xl font-black text-red-900 dark:text-red-100">₹ {todayTotal.toLocaleString()}</p>
                        <p className="text-xs text-red-600 dark:text-red-300 mt-2 flex items-center gap-1">
                            <span className="text-lg">↘</span> Daily Outflow
                        </p>
                    </div>

                    {/* Monthly Total - Amber */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-800/40 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-800/50 shadow-lg">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">Monthly Total</p>
                        <p className="text-3xl font-black text-amber-900 dark:text-amber-100">₹ {monthlyTotal.toLocaleString()}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-300 mt-2">This Month's expenses</p>
                    </div>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow dark:shadow-none">
                        <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">
                            Today's Expense
                        </p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">₹ {todayTotal}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow dark:shadow-none">
                        <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">
                            This Month
                        </p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">₹ {monthlyTotal.toFixed(2)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow dark:shadow-none">
                        <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">
                            Filtered Total
                        </p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">₹ {totalExpenses.toFixed(2)}</p>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h2>
                        {(filterType || filterCategory || filterPaymentMode) && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Expense Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none text-slate-900 dark:text-white"
                            >
                                <option value="">All Types</option>
                                <option value="SHOP">Shop</option>
                                <option value="EMPLOYEE">Employee</option>
                                <option value="STOCK">Stock</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Category
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none text-slate-900 dark:text-white"
                            >
                                <option value="">All Categories</option>
                                <option value="Rent">Rent</option>
                                <option value="Light">Light</option>
                                <option value="Repair">Repair</option>
                                <option value="Salary">Salary</option>
                                <option value="Cloth Purchase">Cloth Purchase</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Payment Mode
                            </label>
                            <select
                                value={filterPaymentMode}
                                onChange={(e) => setFilterPaymentMode(e.target.value)}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none text-slate-900 dark:text-white"
                            >
                                <option value="">All Modes</option>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* MONTHLY BREAKDOWN */}
                {monthlySummary && monthlySummary.breakdown.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow dark:shadow-none">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Monthly Breakdown by Category
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {monthlySummary.breakdown.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
                                >
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{item._id || "Uncategorized"}</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">₹ {item.total}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EXPENSE LIST */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Payment Mode
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Remarks
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            No expenses found. Add your first expense!
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((exp) => (
                                        <tr key={exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                {new Date(exp.created_at).toLocaleDateString("en-IN")}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                                {exp.category}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                                                    {exp.expense_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                                ₹ {exp.amount}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                                                    {exp.payment_mode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                                {exp.remarks || "—"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ADD MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">Add New Expense</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Amount *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none text-slate-900 dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none text-slate-900 dark:text-white"
                                >
                                    <option value="Rent">Rent</option>
                                    <option value="Light">Light</option>
                                    <option value="Repair">Repair</option>
                                    <option value="Salary">Salary</option>
                                    <option value="Cloth Purchase">Cloth Purchase</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Expense Type *
                                </label>
                                <select
                                    value={formData.expense_type}
                                    onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none text-slate-900 dark:text-white"
                                >
                                    <option value="SHOP">Shop</option>
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="STOCK">Stock</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Payment Mode *
                                </label>
                                <select
                                    value={formData.payment_mode}
                                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none text-slate-900 dark:text-white"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Bank">Bank</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Remarks
                                </label>
                                <textarea
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none resize-none text-slate-900 dark:text-white"
                                    rows="3"
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-semibold hover:bg-black dark:hover:bg-slate-200 transition-all shadow-lg shadow-slate-900/20 dark:shadow-none active:scale-95 mt-6"
                            >
                                Add Expense
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
