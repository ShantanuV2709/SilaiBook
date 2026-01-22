import api from "./api";

export const fetchClothStock = async () => {
  const res = await api.get("/cloth-stock/");
  return res.data;
};

export const createClothStock = async (data) => {
  const res = await api.post("/cloth-stock/", data);
  return res.data;
};

export const useCloth = async (id, meters) => {
  const res = await api.post(
    `/cloth-stock/${id}/use/?meters_used=${meters}`
  );
  return res.data;
};

export const updateClothStock = async (id, data) => {
  const res = await api.put(`/cloth-stock/${id}`, data);
  return res.data;
};

export const deleteClothStock = async (id) => {
  const res = await api.delete(`/cloth-stock/${id}`);
  return res.data;
};

export const fetchClothUsageHistory = async () => {
  const res = await api.get("/cloth-stock/usage-history");
  return res.data;
};
