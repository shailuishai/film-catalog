// src/services/api.js
import {refreshToken} from "./userServices/authServices.js";
import ax from "axios";
import axios from "axios";
import Cookies from "js-cookie";

export const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await refreshToken();
                const { access_token } = response.data;
                if (access_token) {
                    Cookies.set("access_token", access_token, { expires: 480 / (60 * 60 * 24), sameSite: "none", secure: true  });
                }
                return api(originalRequest);
            } catch (refreshError) {
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