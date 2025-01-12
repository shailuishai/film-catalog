// src/services/api.js
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL; // Используем переменную окружения

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await refreshToken();
                return api(originalRequest);
            } catch (refreshError) {
                // Редирект только если пользователь не на странице /auth
                if (window.location.pathname !== '/auth') {
                    window.location.href = "/auth";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;