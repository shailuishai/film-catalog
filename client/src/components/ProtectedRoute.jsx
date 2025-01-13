import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Spinner, useToast } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext"; // Используем useAuth из контекста

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки
    const { user, isLoading: authLoading } = useAuth(); // Используем данные из контекста

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                if (!user) {
                    // Попробуем обновить токен, если пользователь не авторизован
                    try {
                        const response = await refreshToken();
                        const { access_token } = response.data;
                        if (access_token) {
                            Cookies.set("access_token", access_token, { expires: 480 / (60 * 60 * 24) });
                            const profile = await getProfile();
                            setUser(profile.data);
                        } else {
                            navigate("/auth");
                        }
                    } catch (refreshError) {
                        navigate("/auth");
                    }
                }
            } catch (error) {
                navigate("/auth");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate, user]);

    // Если идет загрузка, показываем спиннер или заглушку
    if (isLoading || authLoading) {
        return (
            <Flex w="100%" h="100vh" alignItems="center" justifyContent="center">
                <Spinner size="xl" aria-label="Loading" />
            </Flex>
        );
    }

    // Если загрузка завершена и пользователь авторизован, показываем children
    return children;
};

export default ProtectedRoute;