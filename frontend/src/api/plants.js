import api from "./http";

export const getPlantsPaged = async ({ 
  q ="", page=0, size=12, sort="scientificName,asc" 
 }) => {
  const { data } = await api.get("/api/plants/page", { params: { q, page, size, sort } });
  return data; // Page<PlantResponse>
};

export const getPlant = async (id) => {
  const { data } = await api.get(`/api/plants/${id}`);
  return data;
};
