import React, { useEffect, useState } from "react";
import {Navigate, useNavigate} from "react-router-dom";
import { Flex, Spinner, useToast } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext"; // Используем useAuth из контекста

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoading: authLoading, checkAuth } = useAuth();

    useEffect(() => {
        try {
            checkAuth()
            if (adminOnly && !user.is_admin)
            {
                return <Navigate to="/" />;
            }
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