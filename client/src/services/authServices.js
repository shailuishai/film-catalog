import api from "./api";

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
    return response.data;
};

export const oauthSignIn = async (provider) => {
    window.location.href = `${API_URL}/auth/${provider}`; // Перенаправление на провайдера
};

export const handleOAuthCallback = async (provider, code) => {
    const response = await api.get(`/auth/callback/${provider}`, {
        params: { code },
    });
    return response.data;
};