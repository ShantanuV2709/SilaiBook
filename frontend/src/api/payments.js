import api from "./api";

export const fetchPayments = async () => {
  const res = await api.get("/payments");
  return res.data;
};

export const createPayment = async (data) => {
  const res = await api.post("/payments", data);
  return res.data;
};

export const addPayment = async (id, amount) => {
  const res = await api.post(`/payments/${id}/pay`, null, {
    params: { amount },
  });
  return res.data;
};

export const fetchPaymentSummary = async () => {
  const res = await api.get("/payments/customer-summary");
  return res.data;
};

/* ✅ THIS WAS MISSING */
export const fetchCustomerPayments = async (customerId) => {
  const res = await api.get(`/payments/customer/${customerId}`);
  return res.data;
};
