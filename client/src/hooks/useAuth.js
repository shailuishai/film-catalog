import { useState, useEffect } from "react";
import { signIn, signUp, logout, refreshToken } from "../services/authServices";
import { getProfile } from "../services/profileSevices.js"; // Импортируем из profileServices

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Проверка авторизации при загрузке
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const userData = await getProfile(); // Используем getProfile из profileServices
                setUser(userData);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Вход в систему
    const handleSignIn = async (credentials) => {
        setIsLoading(true);
        try {
            const userData = await signIn(credentials);
            setUser(userData);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Регистрация
    const handleSignUp = async (userData) => {
        setIsLoading(true);
        try {
            const userData = await signUp(userData);
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