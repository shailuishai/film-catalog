import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Flex, Spinner } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        // Если пользователь не авторизован и данные загружены, перенаправляем на страницу авторизации
        if (!isLoading && !user) {
            navigate("/auth");
        }

        // Если маршрут только для админов, а пользователь не админ, перенаправляем на главную
        if (!isLoading && user && adminOnly && !user.is_admin) {
            navigate("/");
        }
    }, [user, isLoading, adminOnly, navigate]);

    // Если данные загружаются, показываем спиннер
    if (isLoading) {
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
    return null; // Перенаправление уже обработано в useEffect
};

export default ProtectedRoute;