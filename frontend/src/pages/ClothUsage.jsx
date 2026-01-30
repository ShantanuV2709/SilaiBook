import { useEffect, useState } from "react";
import { fetchClothUsageHistory } from "../api/clothStock";

export default function ClothUsage() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, dateFilter, history]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchClothUsageHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load usage history", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...history];

    // 1. Text Search (Dealer or Cloth Type)
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        h =>
          (h.dealer_name || "").toLowerCase().includes(q) ||
          (h.cloth_type || "").toLowerCase().includes(q)
      );
    }

    // 2. Date Filter
    const now = new Date();
    if (dateFilter === "today") {
      result = result.filter(h => {
        const d = new Date(h.used_at);
        return d.toDateString() === now.toDateString();
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      result = result.filter(h => new Date(h.used_at) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      result = result.filter(h => new Date(h.used_at) >= monthAgo);
    }

    setFilteredHistory(result);
  };

  // Stats
  const totalMetersUsed = filteredHistory.reduce((sum, h) => sum + h.used_meters, 0);
  const uniqueFabrics = new Set(filteredHistory.map(h => h.cloth_type)).size;

  return (
    <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-10 py-10 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Cloth Usage Report</h1>
          <p className="text-slate-600 dark:text-slate-400">Track material consumption over time.</p>
        </div>

        {/* FILTERS & STATS ROW */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* STATS CARDS */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-3xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">Total Used</p>
              <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{totalMetersUsed} m</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-3xl border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">Items Used</p>
              <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{uniqueFabrics}</p>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center gap-4">

            <input
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500"
              placeholder="Search by Fabric or Dealer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex gap-2">
              {['all', 'today', 'week', 'month'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setDateFilter(opt)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${dateFilter === opt
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                  {opt === 'all' ? 'All Time' : opt}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-lg">
          {loading ? (
            <p className="p-8 text-center text-slate-400">Loading history...</p>
          ) : filteredHistory.length === 0 ? (
            <p className="p-8 text-center text-slate-400">No usage records found for this period.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-5">Date</th>
                  <th className="p-5">Fabric Type</th>
                  <th className="p-5">Dealer</th>
                  <th className="p-5">Used By</th>
                  <th className="p-5 text-right">Quantity</th>
                  <th className="p-5 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredHistory.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition">
                    <td className="p-5 text-slate-600 dark:text-slate-400">
                      {new Date(h.used_at).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(h.used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-5 font-bold text-slate-800 dark:text-white">{h.cloth_type}</td>
                    <td className="p-5 text-slate-500 dark:text-slate-400">{h.dealer_name}</td>
                    <td className="p-5">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold uppercase">
                        {h.used_by || "Admin"}
                      </span>
                    </td>
                    <td className="p-5 text-right font-black text-red-500 dark:text-red-400 text-lg">
                      - {h.used_meters} m
                    </td>
                    <td className="p-5 text-right font-medium text-slate-400">
                      {h.remaining_meters} m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
