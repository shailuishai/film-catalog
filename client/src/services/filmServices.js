import api from "./api";

export const getFilms = async (params) => {
    const response = await api.get("/films", { params });
    return response.data;
};

export const getFilmById = async (id) => {
    const response = await api.get(`/films/${id}`);
    return response.data;
};

export const searchFilms = async (query) => {
    const response = await api.get("/films/search", { params: { query } });
    return response.data;
};