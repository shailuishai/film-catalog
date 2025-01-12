import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useToast } from "@chakra-ui/react";
import { getProfile } from "../services/profileSevices"; // Импортируем функцию для получения данных пользователя

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const token = Cookies.get("access_token"); // Получаем токен из куки
                if (!token) {
                    // Если токена нет, перенаправляем на страницу авторизации
                    toast({
                        title: "Доступ запрещен",
                        description: "Пожалуйста, авторизуйтесь для доступа к этой странице.",
                        status: "warning",
                        duration: 5000,
                        isClosable: true,
                    });
                    navigate("/auth");
                    return;
                }

                // Проверяем валидность токена, запрашивая данные пользователя
                const response = await getProfile(); // Запрос на получение данных пользователя
                if (!response.data) {
                    // Если данные пользователя не получены, перенаправляем на страницу авторизации
                    toast({
                        title: "Ошибка доступа",
                        description: "Не удалось загрузить данные пользователя. Пожалуйста, авторизуйтесь снова.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    navigate("/auth");
                    return;
                }

                // Если токен и данные пользователя валидны, разрешаем доступ
            } catch (error) {
                // Если произошла ошибка, перенаправляем на страницу авторизации
                toast({
                    title: "Ошибка доступа",
                    description: "Произошла ошибка при проверке авторизации. Пожалуйста, авторизуйтесь снова.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                navigate("/auth");
            } finally {
                setIsLoading(false); // Завершаем загрузку
            }
        };

        checkAuth(); // Вызываем проверку авторизации
    }, [navigate, toast]);

    // Если идет загрузка, показываем спиннер или заглушку
    if (isLoading) {
        return <div>Загрузка...</div>; // Можно заменить на спиннер или другой индикатор загрузки
    }

    // Если загрузка завершена и пользователь авторизован, показываем children
    return children;
};

export default ProtectedRoute;