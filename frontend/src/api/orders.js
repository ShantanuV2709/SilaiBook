import api from "./api";

export const fetchOrders = async (customerId = null) => {
    const params = customerId ? { customer_id: customerId } : {};
    const res = await api.get("/orders", { params });
    return res.data;
};

export const createOrder = async (data) => {
    const res = await api.post("/orders", data);
    return res.data;
};

export const updateOrderStatus = async (id, status) => {
    const res = await api.put(`/orders/${id}/status`, null, {
        params: { status },
    });
    return res.data;
};

export const markOrderReady = async (id, confirm = true) => {
    const res = await api.post(`/orders/${id}/mark-ready`, null, {
        params: { confirm },
    });
    return res.data;
};
