import api from "./api";
import Cookies from "js-cookie";

// Получение списка фильмов
export const getAdminFilms = async () => {
    const token = Cookies.get("access_token")
    try {
        const response = await api.get("/admin/films", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении фильмов:", error);
        throw error;
    }
};

// Получение списка актеров
export const getAdminActors = async () => {
    const token = Cookies.get("access_token")
    try {
        const response = await api.get("/admin/actors", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении актеров:", error);
        throw error;
    }
};

// Получение списка жанров
export const getAdminGenres = async () => {
    try {
        const response = await api.get("/genres");
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении жанров:", error);
        throw error;
    }
};

// Получение списка отзывов
export const getAdminReviews = async () => {
    const token = Cookies.get("access_token")
    try {
        const response = await api.get("/admin/reviews", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении отзывов:", error);
        throw error;
    }
};

// Получение списка пользователей
export const getAdminUsers = async () => {
    const token = Cookies.get("access_token")
    try {
        const response = await api.get("/admin/users", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении пользователей:", error);
        throw error;
    }
};

// Удаление фильма
export const deleteAdminFilm = async (filmId) => {
    const token = Cookies.get("access_token")
    try {
        const response = await api.delete(`/admin/films/${filmId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
        return response.data;
    } catch (error) {
        console.error("Ошибка при удалении фильма:", error);
        throw error;
    }
};

// Удаление актера
export const deleteAdminActor = async (actorId) => {
    const token = Cookies.get("access_token")
    try {
        const response = await api.delete(`/admin/actors/${actorId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
        return response.data;
    } catch (error) {
        console.error("Ошибка при удалении актера:", error);
        throw error;
    }
};

// Удаление жанра
export const deleteAdminGenre = async (genreId) => {
    const token = Cookies.get("access_token")
    try {
        const response = await api.delete(`/admin/genres/${genreId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
        return response.data;
    } catch (error) {
        console.error("Ошибка при удалении жанра:", error);
        throw error;
    }
};

// Удаление отзыва
export const deleteAdminReview = async (reviewId) => {
    const token = Cookies.get("access_token")
    try {
        const response = await api.delete(`/admin/reviews/${reviewId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
        return response.data;
    } catch (error) {
        console.error("Ошибка при удалении отзыва:", error);
        throw error;
    }
};

// Удаление пользователя
export const deleteAdminUser = async (userId) => {
    const token = Cookies.get("access_token")
    try {
        const response = await api.delete(`/admin/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
        return response.data;
    } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        throw error;
    }
};