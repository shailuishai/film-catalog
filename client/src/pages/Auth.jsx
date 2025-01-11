import React, { useState } from "react";
import {
    Box,
    Flex,
    Input,
    Button,
    VStack,
    Text,
    useToast,
    Divider,
    HStack,
    IconButton,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { FaGoogle, FaYandex } from "react-icons/fa";

const MotionBox = motion(Box);

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [credentials, setCredentials] = useState({ login: "", email: "", password: "" });
    const { signIn, signUp, isLoading } = useAuth();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await signIn(credentials);
            } else {
                await signUp(credentials);
                toast({
                    title: "Регистрация успешна",
                    description: "Пожалуйста, подтвердите ваш email.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Ошибка",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleOAuth = (provider) => {
        window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}`;
    };

    return (
        <Flex justify="center" align="center" h="100vh" bg="gray.50">
            <MotionBox
                w="400px"
                p={6}
                borderWidth="1px"
                borderRadius="md"
                boxShadow="lg"
                bg="white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
            >
                <Text fontSize="2xl" mb={6} textAlign="center">
                    {isLogin ? "Вход" : "Регистрация"}
                </Text>
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <MotionBox
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    w="100%"
                                >
                                    <Input
                                        type="text"
                                        placeholder="Логин (необязательно)"
                                        value={credentials.login}
                                        onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                                    />
                                </MotionBox>
                            )}
                        </AnimatePresence>
                        <Input
                            type="email"
                            placeholder="Email"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            isRequired
                        />
                        <Input
                            type="password"
                            placeholder="Пароль"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            isRequired
                        />
                        <Button type="submit" w="100%" isLoading={isLoading}>
                            {isLogin ? "Войти" : "Зарегистрироваться"}
                        </Button>
                    </VStack>
                </form>
                <Divider my={4} />
                <HStack spacing={4} justify="center">
                    <IconButton
                        aria-label="Войти через Google"
                        icon={<FaGoogle />}
                        onClick={() => handleOAuth("google")}
                        colorScheme="red"
                    />
                    <IconButton
                        aria-label="Войти через Yandex"
                        icon={<FaYandex />}
                        onClick={() => handleOAuth("yandex")}
                        colorScheme="yellow"
                    />
                </HStack>
                <Button
                    variant="link"
                    w="100%"
                    mt={4}
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
                </Button>
            </MotionBox>
        </Flex>
    );
};

export default Auth;