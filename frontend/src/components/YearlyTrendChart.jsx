import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHS = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function YearlyTrendChart({ data }) {
  const chartData = data.map((d) => ({
    name: MONTHS[d.month],
    Income: d.income,
    Expense: d.expense,
    Profit: d.profit,
  }));

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 mb-6">
        Yearly Trend
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="Income"
            stroke="#16a34a"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Expense"
            stroke="#dc2626"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Profit"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
