import { useState, useEffect } from "react";
import { signIn, signUp, logout, refreshToken } from "../services/authServices";
import { getProfile } from "../services/profileSevices.js";
import Cookies from "js-cookie"; // Импортируем из profileServices

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const token = Cookies.get("access_token");
                if (token) {
                    const response = await getProfile();
                    setUser(response.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleSignIn = async (credentials) => {
        setIsLoading(true);
        try {
            const response = await signIn(credentials); // Получаем ответ от сервера
            const { access_token } = response.data; // Извлекаем access_token из response.data

            if (access_token) {
                Cookies.set("access_token", access_token, { expires: 480 / (60 * 60 * 24) });
            }

            // Устанавливаем данные пользователя
            setUser(response.data); // Убедитесь, что response.data содержит данные пользователя
        } catch (error) {
            console.error("Ошибка при входе:", error); // Логируем ошибку
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Регистрация
    const handleSignUp = async (userDataInput) => { // Переименовали параметр
        setIsLoading(true);
        try {
            const userData = await signUp(userDataInput); // Используем переименованную переменную
            setUser(userData);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Выход из системы
    const handleLogout = async () => {
        setIsLoading(true);
        try {
            Cookies.remove("access_token");
            await logout();
            setUser(null);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        isLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        logout: handleLogout,
    };
};