import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Flex, Spinner, useToast } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext"; // Используем useAuth из контекста

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoading: authLoading, checkAuth } = useAuth();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await checkAuth(); // Проверяем авторизацию
                if (adminOnly && !user?.is_admin) {
                    // Если маршрут только для админов, а пользователь не админ, перенаправляем
                    navigate("/");
                }
            } catch (error) {
                // Если произошла ошибка, перенаправляем на страницу авторизации
                navigate("/auth");
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, [adminOnly, user, checkAuth, navigate]);

    if (isLoading || authLoading) {
        return (
            <Flex w="100%" h="100vh" alignItems="center" justifyContent="center">
                <Spinner size="xl" aria-label="Loading" />
            </Flex>
        );
    }

    // Если пользователь авторизован и (если требуется админ, то он админ), показываем children
    if (user && (!adminOnly || user.is_admin)) {
        return children;
    }

    // Если пользователь не авторизован или не админ (если требуется), перенаправляем
    return <Navigate to="/auth" />;
};

export default ProtectedRoute;