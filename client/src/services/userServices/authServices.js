import api from "../api.js";

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

export const OAuth = async (provider) => {
    return await api.get(`/auth/${provider}`);
};

export const OAuthCallback = async (provider, params) => {
    return await api.get(`/auth/${provider}/callback`, {params: params});
};