import { useEffect, useState } from "react";
import api from "../api/api";
// Charts removed as per user request
import AddCustomerModal from "../components/modals/AddCustomerModal";
import AddStockModal from "../components/modals/AddStockModal";
import AddPaymentModal from "../components/modals/AddPaymentModal";
import SendMessageModal from "../components/modals/SendMessageModal";


export default function Dashboard() {
  const [monthly, setMonthly] = useState(null);
  const [yearly, setYearly] = useState([]);

  const [todayIncome, setTodayIncome] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [availableCloth, setAvailableCloth] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);

  // New State for Performance Hub
  const [orders, setOrders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [activeModal, setActiveModal] = useState(null);

  /* ===================== */
  /* LOAD DASHBOARD DATA */
  /* ===================== */
  const loadDashboardData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    api.get(`/dashboard/profit-loss?year=${year}&month=${month}`)
      .then(res => setMonthly(res.data));

    api.get(`/dashboard/yearly-trend?year=${year}`)
      .then(res => setYearly(res.data.months || []));

    api.get("/dashboard/today-income")
      .then(res => setTodayIncome(res.data.today_income || 0));

    api.get("/dashboard/pending-amount")
      .then(res => setPendingAmount(res.data.pending_amount || 0));

    api.get("/dashboard/stock-summary")
      .then(res => setAvailableCloth(res.data.total_remaining_meters || 0))
      .catch(() => setAvailableCloth(0));

    api.get("/dashboard/customer-count")
      .then(res => setTotalCustomers(res.data.total_customers || 0));

    api.get("/expenses/today-total")
      .then(res => setTodayExpense(res.data.today_expense || 0))
      .catch(() => setTodayExpense(0));

    // Load Orders & Payments for Hub
    Promise.all([
      api.get("/orders"),
      api.get("/payments")
    ]).then(([ordersRes, paymentsRes]) => {
      const allOrders = ordersRes.data || [];
      const allPayments = paymentsRes.data || [];

      setOrders(allOrders);

      // Mix Activity
      const activity = [
        ...allOrders.map(o => ({
          type: 'order',
          date: new Date(o.created_at),
          title: `Order #${o.order_number}`,
          subtitle: `${o.customer_name} - ${o.order_type}`,
          amount: null,
          status: o.status
        })),
        ...allPayments.map(p => ({
          type: 'payment',
          date: new Date(p.created_at),
          title: `Payment Received`,
          subtitle: `from ${p.customer_name}`,
          amount: p.paid_amount,
          status: 'Success'
        }))
      ].sort((a, b) => b.date - a.date).slice(0, 5);

      setRecentActivity(activity);
    });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (!monthly) {
    return (
      <div className="min-h-screen bg-[#eef2ee] flex items-center justify-center">
        <p className="text-slate-400 font-semibold">Loading dashboard…</p>
      </div>
    );
  }

  const modalOpen = Boolean(activeModal);

  return (
    <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-12">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Welcome back! Here's what's happening today.</p>
        </div>

        {/* TODAY'S STATS - Enhanced */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">
            Today's Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Income - Green */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20 rounded-3xl p-6 border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Today's Income</p>
              <p className="text-3xl font-black text-green-900 dark:text-green-100">₹ {todayIncome.toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-2 flex items-center gap-1">
                <span className="text-lg">↗</span> Revenue
              </p>
            </div>

            {/* Expense - Red */}
            <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-900/20 rounded-3xl p-6 border-2 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-shadow">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Today's Expense</p>
              <p className="text-3xl font-black text-red-900 dark:text-red-100">₹ {todayExpense.toLocaleString()}</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-2 flex items-center gap-1">
                <span className="text-lg">↘</span> Outflow
              </p>
            </div>

            {/* Net - Blue/Purple */}
            <div className={`bg-gradient-to-br ${todayIncome - todayExpense >= 0 ? 'from-blue-50 to-indigo-100 border-blue-200 dark:from-blue-900/30 dark:to-indigo-900/20 dark:border-blue-800' : 'from-orange-50 to-amber-100 border-orange-200 dark:from-amber-900/30 dark:to-orange-900/20 dark:border-amber-800'} rounded-3xl p-6 border-2 shadow-lg hover:shadow-xl transition-shadow`}>
              <p className={`text-sm font-semibold ${todayIncome - todayExpense >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-amber-400'} mb-2`}>Net Today</p>
              <p className={`text-3xl font-black ${todayIncome - todayExpense >= 0 ? 'text-blue-900 dark:text-blue-100' : 'text-orange-900 dark:text-amber-100'}`}>₹ {(todayIncome - todayExpense).toLocaleString()}</p>
              <p className={`text-xs ${todayIncome - todayExpense >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-orange-600 dark:text-amber-500'} mt-2`}>
                {todayIncome - todayExpense >= 0 ? '✓ Profit' : '⚠ Loss'}
              </p>
            </div>

            {/* Cloth - Teal */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/20 rounded-3xl p-6 border-2 border-teal-200 dark:border-teal-800 shadow-lg hover:shadow-xl transition-shadow">
              <p className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-2">Available Cloth</p>
              <p className="text-3xl font-black text-teal-900 dark:text-teal-100">{availableCloth.toLocaleString()} m</p>
              <p className="text-xs text-teal-600 dark:text-teal-500 mt-2">In Stock</p>
            </div>

            {/* Pending - Amber */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/20 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl transition-shadow">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Pending Payments</p>
              <p className="text-3xl font-black text-amber-900 dark:text-amber-100">₹ {pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">To Collect</p>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              label="Add Customer"
              color="blue"
              disabled={modalOpen}
              onClick={() => setActiveModal("customer")}
            />
            <QuickAction
              label="Add Stock"
              color="teal"
              disabled={modalOpen}
              onClick={() => setActiveModal("stock")}
            />
            <QuickAction
              label="Add Payment"
              color="green"
              disabled={modalOpen}
              onClick={() => setActiveModal("payment")}
            />
            <QuickAction
              label="Send Message"
              color="purple"
              disabled={modalOpen}
              onClick={() => setActiveModal("message")}
            />
          </div>
        </section>

        {/* MONTHLY SUMMARY - Enhanced */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">
            This Month's Performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-green-200 dark:border-green-800 shadow-lg">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Monthly Income</p>
              <p className="text-4xl font-black text-green-600 dark:text-green-400">₹ {monthly.income.toLocaleString()}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                <span className="text-xl">↗</span>
                <span className="font-semibold">Total Revenue</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-red-200 dark:border-red-800 shadow-lg">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Monthly Expense</p>
              <p className="text-4xl font-black text-red-600 dark:text-red-400">₹ {monthly.total_expense.toLocaleString()}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-500">
                <span className="text-xl">↘</span>
                <span className="font-semibold">Total Outflow</span>
              </div>
            </div>

            <div className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border ${monthly.profit >= 0 ? 'border-blue-200 dark:border-blue-800' : 'border-orange-200 dark:border-orange-800'} shadow-lg`}>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Profit / Loss</p>
              <p className={`text-4xl font-black ${monthly.profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>₹ {monthly.profit.toLocaleString()}</p>
              <div className={`mt-3 flex items-center gap-2 text-sm ${monthly.profit >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-orange-600 dark:text-orange-500'}`}>
                <span className="text-xl">{monthly.profit >= 0 ? '✓' : '⚠'}</span>
                <span className="font-semibold">{monthly.profit >= 0 ? 'Profitable' : 'Loss'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* PERFORMANCE HUB */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: GOALS & PIPELINE */}
          <div className="space-y-8">

            {/* 1. Monthly Goals */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-lg">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
                Monthly Goals
              </h3>

              <div className="space-y-6">
                {/* Income Goal */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-500 dark:text-slate-400">Revenue Target (₹1L)</span>
                    <span className="text-slate-900 dark:text-slate-200">{Math.min(100, Math.round((monthly.income / 100000) * 100))}%</span>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (monthly.income / 100000) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">₹ {monthly.income.toLocaleString()} achieved</p>
                </div>

                {/* Expense Limit */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-500 dark:text-slate-400">Expense Limit</span>
                    <span className={`${monthly.total_expense > 50000 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-200'}`}>
                      {Math.round((monthly.total_expense / 50000) * 100)}%
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (monthly.total_expense / 50000) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">₹ {monthly.total_expense.toLocaleString()} / ₹ 50,000</p>
                </div>
              </div>
            </div>

            {/* 2. Order Pipeline */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-lg">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
                Order Pipeline
              </h3>

              <div className="space-y-4">
                {['Received', 'Cutting', 'Stitching', 'Finishing', 'Ready'].map((stage, i) => {
                  const count = orders.filter(o => o.status === stage).length;
                  return (
                    <div key={stage} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${count > 0 ? 'bg-slate-900 dark:bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        {count}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${count > 0 ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{stage}</p>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full opacity-50 ${count > 0 ? 'bg-slate-900 dark:bg-indigo-500' : 'bg-transparent'}`}
                          style={{ width: `${orders.length > 0 ? (count / orders.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: ACTIVITY FEED */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-lg h-full">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              Recent Activity
            </h3>

            <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-3 space-y-8">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${item.type === 'payment' ? 'bg-green-500' : 'bg-blue-500'}`} />

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-200">{item.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{item.date.toLocaleDateString()} • {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {item.amount && (
                      <span className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg text-xs">
                        + ₹{item.amount.toLocaleString()}
                      </span>
                    )}
                    {item.type === 'order' && (
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg text-xs">
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <p className="pl-8 text-slate-400 italic">No recent activity.</p>
              )}
            </div>
          </div>

        </section>
      </div>

      {/* ===================== */}
      {/* REAL MODALS */}
      {/* ===================== */}
      {activeModal === "customer" && (
        <AddCustomerModal
          onClose={() => setActiveModal(null)}
          onSuccess={loadDashboardData}
        />
      )}

      {activeModal === "stock" && (
        <AddStockModal
          onClose={() => setActiveModal(null)}
          onSuccess={loadDashboardData}
        />
      )}

      {activeModal === "payment" && (
        <AddPaymentModal
          onClose={() => setActiveModal(null)}
          onSuccess={loadDashboardData}
        />
      )}

      {activeModal === "message" && (
        <SendMessageModal
          onClose={() => setActiveModal(null)}
        />
      )}


      {/* ===================== */}
      {/* TEMP MODALS */}
      {/* ===================== */}
      {activeModal &&
        activeModal !== "customer" &&
        activeModal !== "stock" &&
        activeModal !== "payment" &&
        activeModal !== "message" && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md relative">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>

              <h2 className="text-2xl font-black mb-4 capitalize text-slate-900 dark:text-white">
                {activeModal}
              </h2>

              <p className="text-slate-600 dark:text-slate-400">
                This feature will be added next.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}

/* ===================== */
/* REUSABLE COMPONENTS */
/* ===================== */

function KpiCard({ label, value }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow">
      <p className="text-sm uppercase tracking-widest font-bold text-slate-400">
        {label}
      </p>
      <p className="mt-4 text-3xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function QuickAction({ label, onClick, disabled, color = 'blue' }) {
  // Define themes
  const themes = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      hover: "hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-300 dark:hover:border-blue-600",
      icon: "text-blue-500"
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-800",
      text: "text-emerald-800 dark:text-emerald-200",
      hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-600",
      icon: "text-emerald-500"
    },
    teal: {
      bg: "bg-teal-50 dark:bg-teal-900/20",
      border: "border-teal-100 dark:border-teal-800",
      text: "text-teal-800 dark:text-teal-200",
      hover: "hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:border-teal-300 dark:hover:border-teal-600",
      icon: "text-teal-500"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-100 dark:border-purple-800",
      text: "text-purple-800 dark:text-purple-200",
      hover: "hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-300 dark:hover:border-purple-600",
      icon: "text-purple-500"
    }
  };

  const theme = themes[color] || themes.blue;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        ${theme.bg} border ${theme.border}
        rounded-3xl px-6 py-6 text-left
        transition-all duration-300
        group
        ${disabled
          ? "opacity-50 cursor-not-allowed"
          : `${theme.hover} hover:shadow-lg hover:-translate-y-1 transform`}
      `}
    >
      <span className={`relative z-10 flex items-center justify-between font-bold ${theme.text}`}>
        {label}
        <span className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 ${theme.icon}`}>
          →
        </span>
      </span>
    </button>
  );
}
