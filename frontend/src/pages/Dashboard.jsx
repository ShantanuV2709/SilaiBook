import { useEffect, useState } from "react";
import api from "../api/api";
// import ProfitChart from "../components/ProfitChart";
// import YearlyTrendChart from "../components/YearlyTrendChart";
import AddCustomerModal from "../components/modals/AddCustomerModal";
import AddStockModal from "../components/modals/AddStockModal";
import AddPaymentModal from "../components/modals/AddPaymentModal";


export default function Dashboard() {
  const [monthly, setMonthly] = useState(null);
  // const [yearly, setYearly] = useState([]);

  const [todayIncome, setTodayIncome] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [availableCloth, setAvailableCloth] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);

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

    // api.get(`/dashboard/yearly-trend?year=${year}`)
    //   .then(res => setYearly(res.data.months || []));

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
    <div className="min-h-screen bg-[#eef2ee]">
      <div className="max-w-7xl mx-auto px-10 py-10 space-y-12">

        {/* HEADER */}
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-2">
          Dashboard
          <span className="text-xs text-red-500">Live</span>
        </h1>

        {/* TODAY OVERVIEW */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-700">
            Today's Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <KpiCard label="Today's Income" value={`₹ ${todayIncome}`} />
            <KpiCard label="Pending Payments" value={`₹ ${pendingAmount}`} />
            <KpiCard label="Available Cloth" value={`${availableCloth} m`} />
            <KpiCard label="Customers" value={totalCustomers} />
            <KpiCard label="Today's Expense" value={`₹ ${todayExpense}`} />
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-700">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              label="Add Customer"
              disabled={modalOpen}
              onClick={() => setActiveModal("customer")}
            />
            <QuickAction
              label="Add Stock"
              disabled={modalOpen}
              onClick={() => setActiveModal("stock")}
            />
            <QuickAction
              label="Add Payment"
              disabled={modalOpen}
              onClick={() => setActiveModal("payment")}
            />
            <QuickAction
              label="Send Message"
              disabled={modalOpen}
              onClick={() => setActiveModal("message")}
            />
          </div>
        </section>

        {/* MONTHLY SUMMARY */}
        {/* <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-700">
            Monthly Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard label="Monthly Income" value={`₹ ${monthly.income}`} />
            <KpiCard label="Monthly Expense" value={`₹ ${monthly.total_expense}`} />
            <KpiCard label="Profit / Loss" value={`₹ ${monthly.profit}`} />
          </div>
        </section> */}

        {/* CHARTS */}
        {/* <ProfitChart
          income={monthly.income}
          expense={monthly.total_expense}
        />

        {yearly.length > 0 && (
          <YearlyTrendChart data={yearly} />
        )} */}
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


      {/* ===================== */}
      {/* TEMP MODALS */}
      {/* ===================== */}
      {activeModal &&
        activeModal !== "customer" &&
        activeModal !== "stock" && 
        activeModal !== "payment" &&(
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md relative">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>

              <h2 className="text-2xl font-black mb-4 capitalize">
                {activeModal}
              </h2>

              <p className="text-slate-600">
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

function QuickAction({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-white border border-slate-200
        rounded-2xl px-6 py-6 text-left
        font-semibold text-slate-700
        transition
        ${disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-slate-900 hover:text-slate-900"}
      `}
    >
      {label}
    </button>
  );
}
