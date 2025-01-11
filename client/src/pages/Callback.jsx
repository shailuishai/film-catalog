// src/pages/Callback.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { handleOAuthCallback } from "../services/authServices.js";
import { useAuth } from "../hooks/useAuth";

const Callback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const provider = location.pathname.split("/").pop();

        const handleCallback = async () => {
            try {
                const userData = await handleOAuthCallback(provider, code);
                setUser(userData);
                navigate("/");
            } catch (error) {
                console.error("Ошибка при обработке OAuth-колбэка:", error);
                navigate("/auth");
            }
        };

        handleCallback();
    }, [location, navigate, setUser]);

    return <div>Обработка OAuth-колбэка...</div>;
};

export default Callback;