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

export const createFilm = async (data, poster) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (poster) {
        formData.append("poster", poster);
    }
    const response = await api.post("/films", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const updateFilm = async (id, data, poster) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (poster) {
        formData.append("poster", poster);
    }
    const response = await api.put(`/films/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const deleteFilm = async (id) => {
    const response = await api.delete(`/films/${id}`);
    return response.data;
};