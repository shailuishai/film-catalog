import api from "./api";

// Получение списка всех жанров
export const getGenres = async (params = {}) => {
    try {
        const response = await api.get("/genres", { params });
        return response.data;
    } catch (err) {
        console.error("Ошибка при получении списка жанров:", err);
        throw err;
    }
};

// Получение информации о конкретном жанре по ID
export const getGenreById = async (id) => {
    try {
        const response = await api.get(`/genres/${id}`);
        return response.data;
    } catch (err) {
        console.error("Ошибка при получении информации о жанре:", err);
        throw err;
    }
};

// Создание нового жанра
export const createGenre = async (name) => {
    try {
        const response = await api.post("/genres", { name });
        return response.data;
    } catch (err) {
        console.error("Ошибка при создании жанра:", err);
        throw err;
    }
};

// Обновление информации о жанре
export const updateGenre = async (genreId, name) => {
    try {
        const response = await api.put("/genres", { genre_id: genreId, name });
        return response.data;
    } catch (err) {
        console.error("Ошибка при обновлении жанра:", err);
        throw err;
    }
};

// Удаление жанра по ID
export const deleteGenre = async (id) => {
    try {
        const response = await api.delete(`/genres/${id}`);
        return response.data;
    } catch (err) {
        console.error("Ошибка при удалении жанра:", err);
        throw err;
    }
};

// Поиск жанров по запросу
export const searchGenres = async (query) => {
    try {
        const response = await api.get("/genres/search", { params: { query } });
        return response.data;
    } catch (err) {
        console.error("Ошибка при поиске жанров:", err);
        throw err;
    }
};