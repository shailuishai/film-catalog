import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Text,
    Button,
    VStack,
    useToast,
    useColorModeValue,
    Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

const Profile = () => {
    const [userData, setUserData] = useState(null); // Данные пользователя
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки
    const toast = useToast();
    const navigate = useNavigate();

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");

    // Получаем accessToken из куки
    const accessToken = Cookies.get("accessToken");

    // Загрузка данных пользователя
    useEffect(() => {
        if (!accessToken) {
            // Если accessToken отсутствует, перенаправляем на страницу авторизации
            navigate("/auth");
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get("/api/user", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setUserData(response.data); // Сохраняем данные пользователя
            } catch (error) {
                toast({
                    title: "Ошибка",
                    description: "Не удалось загрузить данные пользователя.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                navigate("/auth"); // Перенаправляем на страницу авторизации
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [accessToken, navigate, toast]);

    // Выход из системы
    const handleLogout = () => {
        Cookies.remove("accessToken"); // Удаляем accessToken из куки
        toast({
            title: "Вы вышли из системы",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
        navigate("/auth"); // Перенаправляем на страницу авторизации
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <Flex justify="center" align="center" h="100vh" bg={bgColor}>
            <Box
                w="400px"
                p={6}
                borderWidth="1px"
                borderRadius="md"
                boxShadow="lg"
                bg={bgColor}
                borderColor={borderColor}
            >
                <Text fontSize="2xl" mb={6} textAlign="center" color={textColor}>
                    Профиль
                </Text>
                <VStack spacing={4} align="start">
                    {userData && (
                        <>
                            <Text fontSize="lg" color={textColor}>
                                <strong>Email:</strong> {userData.email}
                            </Text>
                            {userData.login && (
                                <Text fontSize="lg" color={textColor}>
                                    <strong>Логин:</strong> {userData.login}
                                </Text>
                            )}
                        </>
                    )}
                    <Button
                        w="100%"
                        colorScheme="red"
                        onClick={handleLogout}
                    >
                        Выйти
                    </Button>
                </VStack>
            </Box>
        </Flex>
    );
};

export default Profile;