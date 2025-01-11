import api from "./api";

export const getProfile = async () => {
    const response = await api.get("/profile");
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