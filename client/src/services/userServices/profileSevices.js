import api from "../api.js";
import Cookies from "js-cookie";

export const getProfile = async () => {
    const token = Cookies.get("access_token");

    const response = await api.get("/profile", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export const updateProfile = async (data, avatarFile, resetAvatar = false) => {
    const formData = new FormData();
    formData.append("json", JSON.stringify(data));
    if (avatarFile) {
        formData.append("avatar", avatarFile);
    }
    if (resetAvatar) {
        formData.append("reset_avatar", true);
    }
    const token = Cookies.get("access_token");
    const response = await api.put("/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteProfile = async () => {
    const token = Cookies.get("access_token");

    const response = await api.delete("/profile", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};