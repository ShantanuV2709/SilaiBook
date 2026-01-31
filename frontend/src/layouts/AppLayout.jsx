import { useNavigate, Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  VscHome,
  VscAccount,
  VscArchive,
  VscCreditCard,
  VscOrganization,
  VscChecklist,
  VscGraph,
  VscSignOut,
  VscPieChart,
  VscBriefcase,
  VscSettingsGear,
} from "react-icons/vsc";

import VerticalDock from "../components/ui/VerticalDock";
import { logout } from "../auth/auth";

export default function AppLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const items = [
    {
      icon: <VscHome size={18} />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      icon: <VscAccount size={18} />,
      label: "Customers",
      onClick: () => navigate("/customers"),
    },
    {
      icon: <VscArchive size={18} />,
      label: "Cloth Stock",
      onClick: () => navigate("/cloth-stock"),
    },
    {
      icon: <VscPieChart size={18} />,
      label: "Stock Analytics",
      onClick: () => navigate("/stock-management"),
    },
    {
      icon: <VscChecklist size={18} />,
      label: "Orders",
      onClick: () => navigate("/orders"),
    },
    {
      icon: <VscCreditCard size={18} />,
      label: "Payments",
      onClick: () => navigate("/payments"),
    },
    {
      icon: <VscOrganization size={18} />,
      label: "Employees",
      onClick: () => navigate("/employees"),
    },
    {
      icon: <VscBriefcase size={18} />,
      label: "Partners",
      onClick: () => navigate("/owners"),
    },
    {
      icon: <VscGraph size={18} />,
      label: "Expenses",
      onClick: () => navigate("/expenses"),
    },
    {
      icon: <VscSettingsGear size={18} />,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    {
      icon: <VscSignOut size={18} />,
      label: "Logout",
      onClick: () => {
        logout();
        navigate("/");
      },
    },
  ];

  // THEME TOGGLE COMPONENT
  const ThemeFooter = (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-yellow-400 hover:bg-white/10 transition"
      title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );

  return (
    <>
      {/* ABSOLUTE TOP-RIGHT LOGO */}
      <div
        className="fixed top-6 right-6 z-[9999] cursor-pointer hover:scale-105 transition drop-shadow-lg"
        onClick={() => navigate("/dashboard")}
      >
        <img
          src="/logo.png"
          alt="SilaiBook"
          className="h-12 md:h-14 w-auto object-cover rounded-2xl shadow-lg border border-white/20"
        />
      </div>

      {/* LEFT NAV DOCK */}
      <VerticalDock items={items} footer={ThemeFooter} />

      {/* MAIN CONTENT */}
      <main className="md:pl-28 md:pr-6 pb-24 md:pb-6 min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] transition-colors duration-300">
        <Outlet />
      </main>
    </>
  );
}
