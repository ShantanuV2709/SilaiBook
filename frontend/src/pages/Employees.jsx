import { useEffect, useState } from "react";
import {
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    payEmployee,
} from "../api/employees";

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [payAmount, setPayAmount] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        work_type: "Stitching",
        salary_type: "Monthly",
        salary_amount: "",
        advance_paid: 0,
    });

    const loadEmployees = async () => {
        try {
            const data = await fetchEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Failed to load employees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedEmployee) {
                await updateEmployee(selectedEmployee._id, formData);
            } else {
                await createEmployee(formData);
            }
            await loadEmployees();
            closeModal();
        } catch (error) {
            console.error("Failed to save employee:", error);
            alert("Failed to save employee");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;
        try {
            await deleteEmployee(id);
            await loadEmployees();
        } catch (error) {
            console.error("Failed to delete employee:", error);
            alert("Failed to delete employee");
        }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        try {
            const amount = parseFloat(payAmount);
            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid amount");
                return;
            }
            await payEmployee(selectedEmployee._id, amount);
            await loadEmployees();
            closePayModal();
        } catch (error) {
            console.error("Failed to record payment:", error);
            alert("Failed to record payment");
        }
    };

    const openAddModal = () => {
        setFormData({
            name: "",
            contact: "",
            work_type: "Stitching",
            salary_type: "Monthly",
            salary_amount: "",
            advance_paid: 0,
        });
        setSelectedEmployee(null);
        setShowModal(true);
    };

    const openEditModal = (emp) => {
        setFormData({
            name: emp.name,
            contact: emp.contact,
            work_type: emp.work_type,
            salary_type: emp.salary_type,
            salary_amount: emp.salary_amount,
            advance_paid: emp.advance_paid || 0,
        });
        setSelectedEmployee(emp);
        setShowModal(true);
    };

    const openPayModal = (emp) => {
        setSelectedEmployee(emp);
        setPayAmount("");
        setShowPayModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedEmployee(null);
    };

    const closePayModal = () => {
        setShowPayModal(false);
        setSelectedEmployee(null);
        setPayAmount("");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] flex items-center justify-center transition-colors duration-300">
                <p className="text-slate-400 font-semibold">Loading employees…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-8">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                        Employees
                    </h1>
                    <button
                        onClick={openAddModal}
                        className="rounded-xl border border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 font-semibold hover:bg-black dark:hover:bg-slate-200 transition"
                    >
                        + Add Employee
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Total Employees - Violet */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-3xl p-6 border-2 border-violet-200 dark:border-violet-800 shadow-lg">
                        <p className="text-sm font-semibold text-violet-700 dark:text-violet-400 mb-2">Total Employees</p>
                        <p className="text-3xl font-black text-violet-900 dark:text-violet-100">{employees.length}</p>
                        <p className="text-xs text-violet-600 dark:text-violet-500 mt-2">Active Workers</p>
                    </div>

                    {/* Total Salaries - Blue */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Total Salaries</p>
                        <p className="text-3xl font-black text-blue-900 dark:text-blue-100">
                            ₹ {employees.reduce((sum, e) => sum + (e.salary_amount || 0), 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">Monthly Commitment</p>
                    </div>

                    {/* Advances Paid - Amber */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Advances Paid</p>
                        <p className="text-3xl font-black text-amber-900 dark:text-amber-100">
                            ₹ {employees.reduce((sum, e) => sum + (e.advance_paid || 0), 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">Total Given</p>
                    </div>

                    {/* Remaining Dues - Red */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-3xl p-6 border-2 border-red-200 dark:border-red-800 shadow-lg">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Remaining Dues</p>
                        <p className="text-3xl font-black text-red-900 dark:text-red-100">
                            ₹ {employees.reduce((sum, e) => sum + ((e.salary_amount || 0) - (e.advance_paid || 0)), 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-500 mt-2 flex items-center gap-1">
                            <span className="text-lg">↘</span> To Pay
                        </p>
                    </div>
                </div>

                {/* EMPLOYEE LIST */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-slate-600 dark:text-slate-300 min-w-[1000px]">
                            <colgroup>
                                <col className="w-[16%]" />
                                <col className="w-[13%]" />
                                <col className="w-[11%]" />
                                <col className="w-[10%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                                <col className="w-[14%]" />
                            </colgroup>
                            <thead>
                                <tr className="text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                                    <th className="py-4 px-6 text-left">Name</th>
                                    <th className="py-4 px-4 text-left">Contact</th>
                                    <th className="py-4 px-4 text-left">Work Type</th>
                                    <th className="py-4 px-4 text-left">Salary Type</th>
                                    <th className="py-4 px-4 text-right">Salary</th>
                                    <th className="py-4 px-4 text-right">Adv. Paid</th>
                                    <th className="py-4 px-4 text-right">Remaining</th>
                                    <th className="py-4 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-12 text-center text-slate-400"
                                        >
                                            No employees found. Add your first employee!
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => {
                                        const remaining =
                                            emp.salary_amount - (emp.advance_paid || 0);
                                        return (
                                            <tr
                                                key={emp._id}
                                                className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition"
                                            >
                                                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white truncate">
                                                    {emp.name}
                                                </td>
                                                <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-sm truncate">
                                                    {emp.contact}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="inline-block px-2 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                                                        {emp.work_type}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-sm">
                                                    {emp.salary_type}
                                                </td>
                                                <td className="py-4 px-4 text-right font-semibold text-slate-900 dark:text-white text-sm tabular-nums">
                                                    ₹ {emp.salary_amount.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400 text-sm tabular-nums">
                                                    ₹ {(emp.advance_paid || 0).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-4 text-right font-semibold text-slate-900 dark:text-white text-sm tabular-nums">
                                                    ₹ {remaining.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => openPayModal(emp)}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white transition"
                                                        >
                                                            Pay
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(emp)}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(emp._id)}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-red-400 hover:text-red-500 dark:hover:text-red-400 transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl border border-slate-100 dark:border-slate-700">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">
                            {selectedEmployee ? "Edit Employee" : "Add New Employee"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none"
                                    placeholder="Employee name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Contact *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.contact}
                                    onChange={(e) =>
                                        setFormData({ ...formData, contact: e.target.value })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none"
                                    placeholder="Phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Work Type *
                                </label>
                                <select
                                    value={formData.work_type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, work_type: e.target.value })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none"
                                >
                                    <option value="Cutting">Cutting</option>
                                    <option value="Stitching">Stitching</option>
                                    <option value="Finishing">Finishing</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Salary Type *
                                </label>
                                <select
                                    value={formData.salary_type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, salary_type: e.target.value })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Salary Amount *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={formData.salary_amount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, salary_amount: e.target.value })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-semibold hover:bg-black dark:hover:bg-slate-200 transition-all shadow-lg active:scale-95 mt-6"
                            >
                                {selectedEmployee ? "Update Employee" : "Add Employee"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* PAY MODAL */}
            {showPayModal && selectedEmployee && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md relative shadow-2xl border border-slate-100 dark:border-slate-700">
                        <button
                            onClick={closePayModal}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">
                            Pay Employee
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{selectedEmployee.name}</p>

                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-6 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Salary Amount:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    ₹ {selectedEmployee.salary_amount}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Already Paid:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    ₹ {selectedEmployee.advance_paid || 0}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2">
                                <span className="text-slate-900 dark:text-white font-bold">Remaining:</span>
                                <span className="font-black text-slate-900 dark:text-white">
                                    ₹{" "}
                                    {(
                                        selectedEmployee.salary_amount -
                                        (selectedEmployee.advance_paid || 0)
                                    ).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handlePay} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Payment Amount *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none"
                                    placeholder="Enter amount to pay"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg active:scale-95"
                            >
                                Record Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
