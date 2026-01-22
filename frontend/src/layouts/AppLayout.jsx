import { useNavigate, Outlet } from "react-router-dom";
import {
  VscHome,
  VscAccount,
  VscArchive,
  VscCreditCard,
  VscOrganization,
  VscChecklist,
  VscSignOut,
} from "react-icons/vsc";

import VerticalDock from "../components/ui/VerticalDock";
import { logout } from "../auth/auth";

export default function AppLayout() {
  const navigate = useNavigate();

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
      icon: <VscSignOut size={18} />,
      label: "Logout",
      onClick: () => {
        logout();
        navigate("/");
      },
    },
  ];

  return (
    <>
      {/* LEFT NAV DOCK */}
      <VerticalDock items={items} />

      {/* MAIN CONTENT */}
      <main className="pl-28 pr-6 py-6 min-h-screen bg-[#eef2ee]">
        <Outlet />
      </main>
    </>
  );
}
