// src/services/api.js
import axios from "axios";

export const API_URL = "https://film-catalog-8re5.onrender.com/v1"; // Замените на ваш API URL

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

                window.location.href = "/auth";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;