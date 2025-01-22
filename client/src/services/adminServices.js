// src/services/adminServices.js
import api from "./api.js";
import Cookies from "js-cookie";

// Films

export const createFilm = async (data) => {
    const formData = new FormData();
    const token = Cookies.get("access_token");
    formData.append("data", JSON.stringify(data));
    if (data.poster) {
        formData.append("poster", data.poster);
    }
    const response = await api.post("/admin/films", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateFilm = async (id, data) => {
    const formData = new FormData();
    const token = Cookies.get("access_token");
    formData.append("data", JSON.stringify(data));
    if (data.poster) {
        formData.append("poster", data.poster);
    }
    const response = await api.put(`/admin/films/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteFilm = async (id) => {
    const token = Cookies.get("access_token");
    const response = await api.delete(`/admin/films/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const adminGetAllFilms = async () => {
    const token = Cookies.get("access_token");
    const response = await api.get("/admin/films", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data; // Возвращаем только массив фильмов
};

export const adminMultiDeleteFilms = async (filmIds) => {
    const token = Cookies.get("access_token");
    const response = await api.delete("/admin/films", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {ids: filmIds.toString()},
    });
    return response.data.data;
};

// Actors
export const createActor = async (actorData) => {
    const token = Cookies.get("access_token");
    const formData = new FormData();
    formData.append("json", JSON.stringify(actorData));
    if (actorData.avatar) {
        formData.append("avatar", actorData.avatar);
    }
    const response = await api.post("/admin/actors", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
        params: {
            reset_avatar: actorData.reset_avatar,
        },
    });
    return response.data.data;
};

export const updateActor = async (id, actorData) => {
    const token = Cookies.get("access_token");
    const formData = new FormData();
    formData.append("name", actorData.name);
    formData.append("wiki_url", actorData.wiki_url);
    if (actorData.avatar) {
        formData.append("avatar", actorData.avatar);
    }
    if (actorData.reset_avatar) {
        formData.append("reset_avatar", true);
    }
    const response = await api.put(`/admin/actors/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const deleteActor = async (id) => {
    const token = Cookies.get("access_token");
    const response = await api.delete(`/admin/actors/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const adminGetAllActors = async () => {
    const token = Cookies.get("access_token");
    const response = await api.get("/admin/actors", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data; // Возвращаем только массив актеров
};

export const adminMultiDeleteActors = async (actorIds) => {
    const token = Cookies.get("access_token");
    const response = await api.delete("/admin/actors", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {ids: actorIds.toString()},
    });
    return response.data.data;
};

// Users
export const adminGetAllUsers = async () => {
    const token = Cookies.get("access_token");
    const response = await api.get("/admin/users", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const adminDeleteUser = async (id) => {
    const token = Cookies.get("access_token");
    const response = await api.delete(`/admin/users/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const adminMultiDeleteUsers = async (userIds) => {
    const token = Cookies.get("access_token");
    const response = await api.delete("/admin/users", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {ids: userIds.toString()},
    });
    return response.data.data;
};

// Reviews
export const adminCreateReview = async (reviewData) => {
    const token = Cookies.get("access_token");
    const response = await api.post("/admin/reviews", reviewData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const adminUpdateReview = async (reviewData) => {
    const token = Cookies.get("access_token");
    const response = await api.put("/admin/reviews", reviewData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const adminDeleteReview = async (id) => {
    const token = Cookies.get("access_token");
    const response = await api.delete(`/admin/reviews/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const adminGetAllReviews = async () => {
    const token = Cookies.get("access_token");
    const response = await api.get("/admin/reviews", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

// Genres
export const createGenre = async (genreData) => {
    const token = Cookies.get("access_token");
    const response = await api.post("/admin/genres", genreData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const updateGenre = async (genreData) => {
    const token = Cookies.get("access_token");
    const response = await api.put("/admin/genres", genreData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const deleteGenre = async (id) => {
    const token = Cookies.get("access_token");
    const response = await api.delete(`/admin/genres/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const getGenres = async () => {
    const token = Cookies.get("access_token");
    const response = await api.get("/admin/genres", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};