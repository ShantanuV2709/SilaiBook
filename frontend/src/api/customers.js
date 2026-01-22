import api from "./api";

export const fetchCustomers = async () => {
  const res = await api.get("/customers");
  return res.data;
};

export const createCustomer = async (data) => {
  const res = await api.post("/customers", data);
  return res.data;
};

export const updateCustomer = async (id, data) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};
