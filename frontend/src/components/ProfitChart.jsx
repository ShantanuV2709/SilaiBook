import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProfitChart({ income, expense }) {
  const data = [
    { name: "Income", amount: income },
    { name: "Expense", amount: expense },
  ];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 mb-6">
        Income vs Expense
      </h2>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={30}>
          <CartesianGrid stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="amount"
            radius={[10, 10, 0, 0]}
            fill="#0f172a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
