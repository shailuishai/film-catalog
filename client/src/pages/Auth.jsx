import React, { useState, useEffect } from "react";
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
    FormControl,
    FormErrorMessage,
    useColorModeValue,
    FormHelperText,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FaGoogle, FaYandex, FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const MotionBox = motion.create(Box);

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [credentials, setCredentials] = useState({ login: "", email: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({ login: "", email: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signIn, signUp, isLoading, handleOAuth } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const accentColor = useColorModeValue("accent.400", "accent.400");

    useEffect(() => {
        if (location.state?.email) {
            setCredentials((prev) => ({ ...prev, email: location.state.email }));
        }
    }, [location.state]);

    useEffect(() => {
        // Сброс полей и ошибок при переключении между режимами
        setCredentials({ login: "", email: "", password: "", confirmPassword: "" });
        setErrors({ login: "", email: "", password: "", confirmPassword: "" });
    }, [isLogin]);

    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasUpperCase && hasLowerCase && hasNumber;
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateFields = () => {
        const newErrors = { login: "", email: "", password: "", confirmPassword: "" };
        let isValid = true;

        if (isLogin) {
            if (!credentials.email.trim() && !credentials.login.trim()) {
                newErrors.email = "Email или логин обязателен";
                isValid = false;
            }
        } else {
            if (!credentials.email.trim()) {
                newErrors.email = "Email обязателен";
                isValid = false;
            } else if (!validateEmail(credentials.email)) {
                newErrors.email = "Некорректный email";
                isValid = false;
            }

            if (!credentials.password.trim()) {
                newErrors.password = "Пароль обязателен";
                isValid = false;
            } else if (credentials.password.length < 6) {
                newErrors.password = "Пароль должен быть не менее 6 символов";
                isValid = false;
            } else if (!validatePassword(credentials.password)) {
                newErrors.password = "Пароль должен содержать хотя бы одну заглавную букву, одну прописную и одну цифру";
                isValid = false;
            }

            if (!credentials.confirmPassword.trim()) {
                newErrors.confirmPassword = "Подтверждение пароля обязательно";
                isValid = false;
            } else if (credentials.password !== credentials.confirmPassword) {
                newErrors.confirmPassword = "Пароли не совпадают";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const toggleMode = () => {
        setIsLogin((prev) => !prev);
    };

    const isEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const handleSubmit = async (e) => {
        setErrors({ login: "", email: "", password: "", confirmPassword: "" });
        e.preventDefault();
        if (!validateFields()) return;

        try {
            if (isLogin) {
                const payload = isEmail(credentials.email)
                    ? { email: credentials.email, password: credentials.password }
                    : { login: credentials.email, password: credentials.password };

                await signIn(payload);

                toast({
                    title: "Успешный вход",
                    description: "Вы успешно вошли в систему.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                const payload = {
                    email: credentials.email,
                    password: credentials.password,
                    login: credentials.login || undefined,
                };

                await signUp(payload);

                toast({
                    title: "Регистрация успешна",
                    description: "Пожалуйста, подтвердите ваш email.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });

                navigate("/confirm-email", { state: { email: credentials.email } });
            }
        } catch (error) {
            let errorMessage = "Произошла ошибка. Пожалуйста, попробуйте снова.";

            if (error.response && error.response.data) {
                const { error: errorType } = error.response.data;

                // Обработка ошибки "failed email or login or password"
                if (errorType === "failed email or login or password") {
                    errorMessage = "Неверный email/логин или пароль.";
                    setErrors({ ...errors, email: errorMessage, password: errorMessage });
                    return;
                }

                switch (errorType) {
                    case "user with this email already exists":
                        errorMessage = "Пользователь с таким email уже существует.";
                        setErrors({ ...errors, email: errorMessage });
                        return;
                    case "login already exists":
                        errorMessage = "Пользователь с таким логином уже существует.";
                        setErrors({ ...errors, login: errorMessage });
                        return;
                    case "user not found":
                        errorMessage = "Пользователь не найден.";
                        setErrors({ ...errors, email: "Неверный email/логин или пароль", password: "Неверный email/логин или пароль" });
                        return;
                    case "email not confirmed":
                        errorMessage = "Email не подтвержден.";
                        isEmail(credentials.email) ? navigate("/confirm-email", { state: { email: credentials.email } }) : navigate("/confirm-email");
                        return;
                    default:
                        errorMessage = error.message || errorMessage;
                }
            }

            toast({
                title: "Ошибка",
                description: errorMessage,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Flex justify="center" align="center" h="100vh" bg={bgColor}>
            <AnimatePresence mode="wait">
                <MotionBox
                    key={isLogin ? "login" : "register"}
                    initial={{ opacity: 0, x: isLogin ? -400 : 400 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isLogin ? 400 : -400 }}
                    transition={{ duration: 0.5 }}
                    position="relative"
                    zIndex={20}
                    w="400px"
                    p={6}
                    borderWidth="2px"
                    borderRadius="md"
                    boxShadow="lg"
                    bg={bgColor}
                    borderColor={borderColor}
                >
                    <Text fontWeight="bold" fontSize="2xl" mb={4} textAlign="center" color={textColor}>
                        {isLogin ? "Вход" : "Регистрация"}
                    </Text>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={4}>
                            {isLogin ? (
                                <FormControl isInvalid={!!errors.email}>
                                    <Input
                                        maxW="400px"
                                        minW="200px"
                                        type="text"
                                        placeholder="Email или логин"
                                        value={credentials.email}
                                        onChange={(e) => {
                                            setCredentials({ ...credentials, email: e.target.value });
                                            if (errors.email) setErrors({ ...errors, email: "" });
                                        }}
                                        border="2px solid"
                                        borderColor={borderColor}
                                        boxShadow="lg"
                                        focusBorderColor={accentColor}
                                    />
                                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                                </FormControl>
                            ) : (
                                <>
                                    <FormControl isInvalid={!!errors.login}>
                                        <Input
                                            maxW="400px"
                                            minW="200px"
                                            type="text"
                                            placeholder="Логин (необязательно)"
                                            value={credentials.login}
                                            onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                                            border="2px solid"
                                            borderColor={borderColor}
                                            boxShadow="lg"
                                            focusBorderColor={accentColor}
                                        />
                                        <FormErrorMessage>{errors.login}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={!!errors.email}>
                                        <Input
                                            maxW="400px"
                                            minW="200px"
                                            type="email"
                                            placeholder="Email"
                                            value={credentials.email}
                                            onChange={(e) => {
                                                setCredentials({ ...credentials, email: e.target.value });
                                                if (errors.email) setErrors({ ...errors, email: "" });
                                            }}
                                            border="2px solid"
                                            borderColor={borderColor}
                                            boxShadow="lg"
                                            focusBorderColor={accentColor}
                                        />
                                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                                        {credentials.email && !validateEmail(credentials.email) && (
                                            <FormHelperText color="red.500">
                                                Введите корректный email, например: user@example.com
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </>
                            )}

                            <FormControl isInvalid={!!errors.password}>
                                <InputGroup>
                                    <Input
                                        maxW="400px"
                                        minW="200px"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Пароль"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        border="2px solid"
                                        borderColor={borderColor}
                                        boxShadow="lg"
                                        focusBorderColor={accentColor}
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                                            size="sm"
                                            onClick={() => setShowPassword(!showPassword)}
                                            variant="ghost"
                                        />
                                    </InputRightElement>
                                </InputGroup>
                                <FormErrorMessage>{errors.password}</FormErrorMessage>
                            </FormControl>

                            {!isLogin && (
                                <FormControl isInvalid={!!errors.confirmPassword}>
                                    <InputGroup>
                                        <Input
                                            maxW="400px"
                                            minW="200px"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Подтвердите пароль"
                                            value={credentials.confirmPassword}
                                            onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                                            border="2px solid"
                                            borderColor={borderColor}
                                            boxShadow="lg"
                                            focusBorderColor={accentColor}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                                                icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                size="sm"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                variant="ghost"
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                    <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                                </FormControl>
                            )}

                            <Button
                                type="submit"
                                w="100%"
                                isLoading={isLoading}
                                variant={"solid"}
                                colorScheme="brand"
                            >
                                {isLogin ? "Войти" : "Зарегистрироваться"}
                            </Button>
                        </VStack>
                    </form>

                    <Divider my={4} borderColor={borderColor} />

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

                    <Flex justify="center" mt={4}>
                        <Button
                            onClick={toggleMode}
                            leftIcon={isLogin ? <FaUserPlus /> : <FaSignInAlt />}
                            variant="outline"
                            colorScheme="brand"
                            size="sm"
                            borderRadius="full"
                            _hover={{ bg: "brand.50" }}
                        >
                            {isLogin ? "Создать аккаунт" : "Уже есть аккаунт?"}
                        </Button>
                    </Flex>
                </MotionBox>
            </AnimatePresence>
        </Flex>
    );
};

export default Auth;