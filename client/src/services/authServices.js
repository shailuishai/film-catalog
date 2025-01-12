import api from "./api";
import Cookies from "js-cookie";

export const signIn = async (credentials) => {
    const response = await api.post("/auth/sign-in", credentials);
    return response.data;
};

export const signUp = async (userData) => {
    const response = await api.post("/auth/sign-up", userData);
    return response.data;
};

export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

export const refreshToken = async () => {
    const response = await api.post("/auth/refresh-token");
    const { access_token } = response.data;

    if (access_token) {
        Cookies.set("access_token", access_token, { expires: 480 / (60 * 60 * 24) });
    }

    return response.data;
};
export const handleOAuth = async (provider) => {
    try {
        const response = await api.get(`/auth/${provider}`);
        const authUrl = response.request.responseURL;

        window.location.href = authUrl;
    } catch (error) {
        console.error("OAuth error:", error);
    }
};

export const handleOAuthCallback = async (provider, code) => {
    const response = await api.get(`/auth/${provider}/callback`, {
        params: { code },
    });
    return response.data;
};