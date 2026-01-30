import { useState, useEffect } from "react";
import { fetchClothStock, fetchClothUsageHistory } from "../api/clothStock";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#8884d8"];

export default function StockManagement() {
    const [stocks, setStocks] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        try {
            const stockData = await fetchClothStock();
            console.log("Stock Data:", stockData);
            setStocks(Array.isArray(stockData) ? stockData : []);
        } catch (err) {
            console.error("Failed to load stock data", err);
        }

        try {
            const historyData = await fetchClothUsageHistory();
            console.log("History Data:", historyData);
            setHistory(Array.isArray(historyData) ? historyData : []);
        } catch (err) {
            console.error("Failed to load history data", err);
        }

        setLoading(false);
    };

    /* ===================== */
    /* ANALYTICS CALC */
    /* ===================== */

    // 1. Total Value of current stock
    const totalValue = stocks.reduce((sum, s) => sum + (s.remaining_meters * s.price_per_meter), 0);

    // 2. Total Meters
    const totalMeters = stocks.reduce((sum, s) => sum + s.remaining_meters, 0);

    // 3. Low Stock Items (< 10m)
    const lowStockItems = stocks.filter(s => s.remaining_meters < 10);

    // 4. Dealer Breakdown (Meters)
    const dealerStats = {};
    stocks.forEach(s => {
        const dealer = s.dealer_name || "Unknown";
        dealerStats[dealer] = (dealerStats[dealer] || 0) + s.remaining_meters;
    });

    const dealerChartData = Object.keys(dealerStats).map(k => ({
        name: k,
        value: dealerStats[k]
    }));

    // 5. Cloth Type Breakdown
    const typeStats = {};
    stocks.forEach(s => {
        const type = s.cloth_type || "Other";
        typeStats[type] = (typeStats[type] || 0) + s.remaining_meters;
    });
    const typeChartData = Object.keys(typeStats).map(k => ({
        name: k,
        meters: typeStats[k]
    }));


    /* ===================== */
    /* RENDER */
    /* ===================== */
    if (loading) return <div className="p-10 text-slate-400">Loading stock analytics...</div>;

    return (
        <div className="min-h-screen bg-[#eef2ee] dark:bg-[#0f172a] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-8">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Stock Management (Beta)</h1>
                    <p className="text-slate-600 dark:text-slate-400">Advanced analysis of your cloth inventory.</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Total Value */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Total Inventory Value</p>
                        <p className="text-3xl font-black text-indigo-900 dark:text-indigo-100">₹ {totalValue.toLocaleString()}</p>
                    </div>

                    {/* Total Meters */}
                    <div className="bg-gradient-to-br from-teal-50 to-green-100 dark:from-teal-900/20 dark:to-green-900/20 p-6 rounded-3xl border border-teal-200 dark:border-teal-800 shadow-sm">
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">Total Stock (Meters)</p>
                        <p className="text-3xl font-black text-teal-900 dark:text-teal-100">{totalMeters.toLocaleString()} m</p>
                    </div>

                    {/* Low Stock Count */}
                    <div className={`bg-gradient-to-br ${lowStockItems.length > 0 ? 'from-orange-50 to-red-100 border-orange-200 dark:from-orange-900/20 dark:to-red-900/20 dark:border-orange-800' : 'from-slate-50 to-slate-100 border-slate-200 dark:from-slate-800 dark:to-slate-700 dark:border-slate-600'} p-6 rounded-3xl border shadow-sm`}>
                        <p className={`text-xs font-bold ${lowStockItems.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'} uppercase tracking-wider mb-2`}>Low Stock Alerts</p>
                        <p className={`text-3xl font-black ${lowStockItems.length > 0 ? 'text-red-900 dark:text-red-100' : 'text-slate-900 dark:text-slate-100'}`}>{lowStockItems.length} Items</p>
                    </div>

                    {/* Dealers Count */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 p-6 rounded-3xl border border-violet-200 dark:border-violet-800 shadow-sm">
                        <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Active Dealers</p>
                        <p className="text-3xl font-black text-violet-900 dark:text-violet-100">{Object.keys(dealerStats).length}</p>
                    </div>
                </div>

                {/* CHARTS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* DEALER DISTRIBUTION */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Stock by Dealer</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dealerChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="transparent"
                                    >
                                        {dealerChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {dealerChartData.length === 0 && <p className="text-center text-slate-400">No data available</p>}
                    </div>

                    {/* CLOTH TYPE DISTRIBUTION */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Stock by Cloth Type</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={typeChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" strokeOpacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }} />
                                    <Bar dataKey="meters" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* LOW STOCK + RECENT USAGE ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LOW STOCK ALERTS */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-lg overflow-hidden">
                        <div className="p-6 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30">
                            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                                ⚠ Low Stock Warnings
                            </h3>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            {lowStockItems.length === 0 ? (
                                <p className="p-8 text-center text-slate-400">All stock levels are healthy.</p>
                            ) : (
                                <table className="w-full text-sm min-w-[400px]">
                                    <thead className="bg-red-50/50 dark:bg-red-900/20 text-red-900 dark:text-red-200 font-semibold">
                                        <tr>
                                            <th className="text-left p-4">Fabric</th>
                                            <th className="text-left p-4">Dealer</th>
                                            <th className="text-right p-4">Remaining</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-50 dark:divide-red-900/20">
                                        {lowStockItems.map(item => (
                                            <tr key={item._id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 text-slate-700 dark:text-slate-300">
                                                <td className="p-4 font-medium">{item.cloth_type}</td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{item.dealer_name}</td>
                                                <td className="p-4 text-right font-bold text-red-600 dark:text-red-400">{item.remaining_meters} m</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* RECENT USAGE */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Usage History</h3>
                        </div>
                        <div className="p-0 max-h-[300px] overflow-y-auto overflow-x-auto">
                            {history.length === 0 ? (
                                <p className="p-8 text-center text-slate-400">No usage history found.</p>
                            ) : (
                                <table className="w-full text-sm min-w-[400px]">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="text-left p-4">Date</th>
                                            <th className="text-left p-4">Fabric</th>
                                            <th className="text-right p-4">Used</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {history.map(h => (
                                            <tr key={h._id} className="text-slate-700 dark:text-slate-300">
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {new Date(h.used_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 font-medium">
                                                    {h.cloth_type} <span className="text-xs text-slate-400">({h.dealer_name})</span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                                                    {h.used_meters} m
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
