import api from "./api";

export const fetchOwners = async () => {
    const res = await api.get("/owners/");
    return res.data;
};

export const createOwner = async (data) => {
    const res = await api.post("/owners/", data);
    return res.data;
};

export const updateOwner = async (id, data) => {
    const res = await api.put(`/owners/${id}`, data);
    return res.data;
};

export const deleteOwner = async (id) => {
    const res = await api.delete(`/owners/${id}`);
    return res.data;
};

export const recordWithdrawal = async (id, amount, note) => {
    const res = await api.post(`/owners/${id}/withdraw`, { amount, note });
    return res.data;
};

export const recordDeposit = async (id, amount, note) => {
    const res = await api.post(`/owners/${id}/deposit`, { amount, note });
    return res.data;
};
