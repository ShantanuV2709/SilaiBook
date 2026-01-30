import api from "./api";

export const fetchEmployees = async () => {
  const res = await api.get("/employees");
  return res.data;
};

export const createEmployee = async (data) => {
  const res = await api.post("/employees", data);
  return res.data;
};

export const updateEmployee = async (id, data) => {
  const res = await api.put(`/employees/${id}`, data);
  return res.data;
};

export const deleteEmployee = async (id) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
};

export const payEmployee = async (id, amount) => {
  const res = await api.put(`/employees/${id}/pay?amount=${amount}`);
  return res.data;
};

export const getEmployeeStatus = async (id) => {
  const res = await api.get(`/employees/${id}/status`);
  return res.data;
};
