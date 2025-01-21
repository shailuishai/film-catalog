// src/services/adminServices.js
import api from "./api.js";
import Cookies from "js-cookie";

// Films
export const createFilm = async (filmData) => {
    const token = Cookies.get("access_token");
    const response = await api.post("/admin/films", filmData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateFilm = async (id, filmData) => {
    const token = Cookies.get("access_token");
    const response = await api.put(`/admin/films/${id}`, filmData, {
        headers: {
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
    return response.data;
};

export const adminMultiDeleteFilms = async (filmIds) => {
    const token = Cookies.get("access_token");
    const response = await api.delete("/admin/films", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        data: filmIds,
    });
    return response.data;
};

// Actors
export const createActor = async (actorData) => {
    const token = Cookies.get("access_token");
    const response = await api.post("/admin/actors", actorData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateActor = async (id, actorData) => {
    const token = Cookies.get("access_token");
    const response = await api.put(`/admin/actors/${id}`, actorData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteActor = async (id) => {
    const token = Cookies.get("access_token");
    const response = await api.delete(`/admin/actors/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const adminGetAllActors = async () => {
    const token = Cookies.get("access_token");
    const response = await api.get("/admin/actors", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const adminMultiDeleteActors = async (actorIds) => {
    const token = Cookies.get("access_token");
    const response = await api.delete("/admin/actors", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        data: actorIds,
    });
    return response.data;
};

// Users
export const adminGetAllUsers = async () => {
    const token = Cookies.get("access_token");
    const response = await api.get("/admin/users", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const adminDeleteUser = async (id) => {
    const token = Cookies.get("access_token");
    const response = await api.delete(`/admin/users/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const adminMultiDeleteUsers = async (userIds) => {
    const token = Cookies.get("access_token");
    const response = await api.delete("/admin/users", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        data: userIds,
    });
    return response.data;
};

// Reviews
export const adminCreateReview = async (reviewData) => {
    const token = Cookies.get("access_token");
    const response = await api.post("/admin/reviews", reviewData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const adminUpdateReview = async (reviewData) => {
    const token = Cookies.get("access_token");
    const response = await api.put("/admin/reviews", reviewData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const adminDeleteReview = async (id) => {
    const token = Cookies.get("access_token");
    const response = await api.delete(`/admin/reviews/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const adminGetAllReviews = async () => {
    const token = Cookies.get("access_token");
    const response = await api.get("/admin/reviews", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Genres
export const createGenre = async (genreData) => {
    const token = Cookies.get("access_token");
    const response = await api.post("/admin/genres", genreData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateGenre = async (genreData) => {
    const token = Cookies.get("access_token");
    const response = await api.put("/admin/genres", genreData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteGenre = async (id) => {
    const token = Cookies.get("access_token");
    const response = await api.delete(`/admin/genres/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getGenres = async () => {
    const token = Cookies.get("access_token");
    const response = await api.get("/admin/genres", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};