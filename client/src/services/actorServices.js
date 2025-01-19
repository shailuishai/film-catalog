import api from "./api";

export const getActors = async (params) => {
    const response = await api.get("/actors", { params });
    return response.data;
};

export const getActorById = async (id) => {
    const response = await api.get(`/actors/${id}`);
    return response.data;
};

export const searchActors = async (query) => {
    const response = await api.get("/actors/search", { params: { query } });
    return response.data;
};