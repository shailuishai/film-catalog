import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Input,
    Button,
    Text,
    useToast,
    useColorModeValue,
    FormControl,
    FormErrorMessage,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { sendConfirmationCode, confirmEmail } from "../services/userServices/emailServices.js";
import { useAuth } from "../context/AuthContext"; // Используем useAuth из контекста

const ConfirmEmail = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [timer, setTimer] = useState(60); // Таймер на 1 минуту
    const [errors, setErrors] = useState({ email: "", code: "" });
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation(); // Получаем состояние маршрута

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const accentColor = useColorModeValue("accent.400", "accent.400");

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    useEffect(() => {
        if (email && location.state?.email) {
            handleSendCode();
        }
    }, [email]);

    // Таймер для ограничения на повторную отправку кода
    useEffect(() => {
        if (isCodeSent && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isCodeSent, timer]);

    // Отправка кода подтверждения
    const handleSendCode = async () => {
        if (!email) {
            setErrors({ ...errors, email: "Email обязателен" });
            return;
        }

        try {
            setIsLoading(true);
            await sendConfirmationCode(email);
            setIsCodeSent(true);
            setTimer(60); // Сброс таймера
            toast({
                title: "Код отправлен",
                description: "Проверьте вашу почту для получения кода подтверждения.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Ошибка",
                description: error.response?.data?.error || "Не удалось отправить код.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Подтверждение email
    const handleConfirmEmail = async () => {
        if (!code) {
            setErrors({ ...errors, code: "Код обязателен" });
            return;
        }

        try {
            setIsLoading(true);
            await confirmEmail(email, code);
            toast({
                title: "Email подтвержден",
                description: "Ваш email успешно подтвержден.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate("/auth", { state: { email } }); // Редирект на страницу авторизации с email
        } catch (error) {
            toast({
                title: "Ошибка",
                description: error.response?.data?.error || "Не удалось подтвердить email.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                    Подтверждение почты
                </Text>
                <FormControl isInvalid={!!errors.email} mb={4}>
                    <Input
                        type="email"
                        placeholder="Введите ваш email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        borderColor={borderColor}
                        _focus={{ borderColor: accentColor }}
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.code} mb={4}>
                    <Input
                        type="text"
                        placeholder="Введите код подтверждения"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        borderColor={borderColor}
                        _focus={{ borderColor: accentColor }}
                    />
                    <FormErrorMessage>{errors.code}</FormErrorMessage>
                </FormControl>
                <Button
                    w="100%"
                    mb={4}
                    onClick={handleConfirmEmail}
                    isLoading={isLoading}
                    colorScheme="brand"
                >
                    Подтвердить email
                </Button>
                <Button
                    w="100%"
                    onClick={handleSendCode}
                    isDisabled={isCodeSent && timer > 0}
                    isLoading={isLoading}
                    colorScheme="brand"
                    variant="outline"
                >
                    {isCodeSent && timer > 0 ? `Отправить код повторно (${timer} сек)` : "Отправить код"}
                </Button>
            </Box>
        </Flex>
    );
};

export default ConfirmEmail;