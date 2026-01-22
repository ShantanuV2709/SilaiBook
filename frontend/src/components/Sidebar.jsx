import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const base =
    "flex items-center px-4 py-3 rounded-xl font-semibold transition";

  const active =
    "bg-slate-900 text-white";

  const inactive =
    "text-slate-600 hover:bg-slate-100";

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 space-y-6">
      <h2 className="text-2xl font-black text-slate-900">
        SilaiBook
      </h2>

      <nav className="space-y-2">
        <NavLink to="/dashboard" className={({isActive}) =>
          `${base} ${isActive ? active : inactive}`
        }>
          Dashboard
        </NavLink>

        <NavLink to="/customers" className={({isActive}) =>
          `${base} ${isActive ? active : inactive}`
        }>
          Customers
        </NavLink>

        <NavLink to="/cloth-stock" className={({isActive}) =>
          `${base} ${isActive ? active : inactive}`
        }>
          Cloth Stock
        </NavLink>

        <NavLink to="/employees" className={({isActive}) =>
          `${base} ${isActive ? active : inactive}`
        }>
          Employees
        </NavLink>

        <NavLink to="/payments" className={({isActive}) =>
          `${base} ${isActive ? active : inactive}`
        }>
          Payments
        </NavLink>

        <NavLink to="/expenses" className={({isActive}) =>
          `${base} ${isActive ? active : inactive}`
        }>
          Expenses
        </NavLink>
      </nav>
    </aside>
  );
}
