import api from "./api";
import Cookies from "js-cookie";

export const getProfile = async () => {
    const token = Cookies.get("access_token"); // Получаем токен из куки
    if (!token) {
        throw new Error("Токен отсутствует"); // Если токена нет, выбрасываем ошибку
    }

    const response = await api.get("/profile", {
        headers: {
            Authorization: `Bearer ${token}`, // Передаем токен в заголовке
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

    const response = await api.put("/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const deleteProfile = async () => {
    const response = await api.delete("/profile");
    return response.data;
};