import { useNavigate } from "react-router-dom";
import {
  VscAccount,
  VscArchive,
  VscCreditCard,
  VscComment
} from "react-icons/vsc";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Add Customer",
      icon: <VscAccount size={22} />,
      onClick: () => navigate("/customers")
    },
    {
      label: "Add Stock",
      icon: <VscArchive size={22} />,
      onClick: () => navigate("/cloth-stock")
    },
    {
      label: "Add Payment",
      icon: <VscCreditCard size={22} />,
      onClick: () => navigate("/payments")
    },
    {
      label: "Send Message",
      icon: <VscComment size={22} />,
      onClick: () => alert("Messaging coming soon")
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.05)]">
      <h2 className="text-lg font-bold text-slate-900 mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            className="
              group flex flex-col items-center justify-center gap-3
              rounded-2xl border border-slate-200
              px-6 py-6
              hover:border-slate-900
              hover:bg-slate-50
              transition-all
            "
          >
            <div className="
              flex items-center justify-center
              w-12 h-12 rounded-xl
              bg-slate-900 text-white
              group-hover:scale-110
              transition-transform
            ">
              {a.icon}
            </div>

            <span className="text-sm font-semibold text-slate-700">
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}