// src/pages/Auth.jsx
import React, { useState } from "react";
import { Box, Flex, Input, Button, VStack, Text, useToast } from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const { signIn, signUp, isLoading } = useAuth();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await signIn(credentials);
            } else {
                await signUp(credentials);
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

    return (
        <Flex justify="center" align="center" h="100vh">
            <Box w="400px" p={6} borderWidth="1px" borderRadius="md" boxShadow="lg">
                <Text fontSize="2xl" mb={6} textAlign="center">
                    {isLogin ? "Вход" : "Регистрация"}
                </Text>
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <Input
                            type="email"
                            placeholder="Email"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        />
                        <Input
                            type="password"
                            placeholder="Пароль"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />
                        <Button type="submit" w="100%" isLoading={isLoading}>
                            {isLogin ? "Войти" : "Зарегистрироваться"}
                        </Button>
                        <Button
                            variant="link"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    );
};

export default Auth;