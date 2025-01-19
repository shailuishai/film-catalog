import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Spinner, useToast } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext"; // Используем useAuth из контекста

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки
    const { user, isLoading: authLoading, checkAuth } = useAuth(); // Используем данные из контекста

    useEffect(() => {
        try {
            checkAuth()
        } catch (error) {
            setIsLoading(false);
            navigate("/auth")
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (isLoading || authLoading) {
        return (
            <Flex w="100%" h="100vh" alignItems="center" justifyContent="center">
                <Spinner size="xl" aria-label="Loading" />
            </Flex>
        );
    }

    return children;
};

export default ProtectedRoute;