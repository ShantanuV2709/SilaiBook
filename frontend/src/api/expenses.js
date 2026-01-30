import api from "./api";

export const fetchExpenses = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.expense_type) params.append("expense_type", filters.expense_type);
    if (filters.category) params.append("category", filters.category);
    if (filters.payment_mode) params.append("payment_mode", filters.payment_mode);

    const res = await api.get(`/expenses?${params.toString()}`);
    return res.data;
};

export const addExpense = async (data) => {
    const res = await api.post("/expenses", data);
    return res.data;
};

export const getTodayExpense = async (expense_type = null) => {
    const params = expense_type ? `?expense_type=${expense_type}` : "";
    const res = await api.get(`/expenses/today-total${params}`);
    return res.data;
};

export const getMonthlySummary = async (year, month, expense_type = null) => {
    const params = new URLSearchParams({ year, month });
    if (expense_type) params.append("expense_type", expense_type);

    const res = await api.get(`/expenses/monthly-summary?${params.toString()}`);
    return res.data;
};
