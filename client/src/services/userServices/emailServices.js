import api from "../api.js";

export const sendConfirmationCode = async (email) => {
    const response = await api.post("/email/send-code", { email });
    return response.data;
};

export const confirmEmail = async (email, code) => {
    const response = await api.put("/email/confirm", { email, code });
    return response.data;
};