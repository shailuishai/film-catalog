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
import { FaGoogle, FaYandex, FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import LandArea from "../components/LandArea";

const MotionBox = motion.create(Box);

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true); // Режим входа или регистрации
    const [credentials, setCredentials] = useState({ login: "", email: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({ login: "", email: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false); // Видимость пароля
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Видимость подтверждения пароля
    const { signIn, signUp, isLoading, handleOAuth } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [isRegistrationVisible, setIsRegistrationVisible] = useState(false);

    const handleDigComplete = () => {
        setIsRegistrationVisible(true); // Показываем кнопку регистрации после "откапывания"
    };


    // Цвета из темы
    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const accentColor = useColorModeValue("accent.400", "accent.400");

    useEffect(() => {
        if (location.state?.email) {
            setCredentials((prev) => ({ ...prev, email: location.state.email }));
        }
    }, [location.state]);

    // Валидация пароля
    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasUpperCase && hasLowerCase && hasNumber;
    };

    // Валидация email
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Валидация полей
    const validateFields = () => {
        const newErrors = { login: "", email: "", password: "", confirmPassword: "" };
        let isValid = true;

        if (isLogin) {
            // Валидация для входа
            if (!credentials.email.trim() && !credentials.login.trim()) {
                newErrors.email = "Email или логин обязателен";
                isValid = false;
            }
        } else {
            // Валидация для регистрации
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

    // Очистка полей и ошибок при переключении режима
    const toggleMode = () => {
        setCredentials({ login: "", email: "", password: "", confirmPassword: "" });
        setErrors({ login: "", email: "", password: "", confirmPassword: "" });
        setIsLogin((prev) => !prev);
    };

    // Определяет, является ли значение email или логином
    const isEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    // Обработка отправки формы
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
                // Регистрация
                const payload = {
                    email: credentials.email,
                    password: credentials.password,
                    login: credentials.login || undefined, // Логин не обязателен
                };

                await signUp(payload);

                toast({
                    title: "Регистрация успешна",
                    description: "Пожалуйста, подтвердите ваш email.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });

                // Передаем email через состояние маршрута
                navigate("/confirm-email", { state: { email: credentials.email } });
            }
        } catch (error) {
            let errorMessage = "Произошла ошибка. Пожалуйста, попробуйте снова.";

            if (error.response && error.response.data) {
                const { error: errorType } = error.response.data;

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
        <Flex justify="center" align="center" h="100vh" bg={useColorModeValue("white", "brand.900")}>
            <MotionBox
                position="relative"
                zIndex={20}
                w="400px"
                p={6}
                borderWidth="2px"
                borderRadius="md"
                boxShadow="lg"
                bg={useColorModeValue("white", "brand.900")}
                borderColor={useColorModeValue("gray.200", "brand.800")}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
            >
                <Text fontWeight="bold" fontSize="2xl" mb={4} textAlign="center" color={textColor}>
                    {isLogin ? "Вход" : "Регистрация"}
                </Text>
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        {/* Поле для входа: email или логин */}
                        {isLogin && (
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
                        )}

                        {/* Поле для регистрации: email */}
                        {!isLogin && (
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

                        {/* Поле для пароля */}
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

                        {/* Поле для подтверждения пароля (только для регистрации) */}
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

                        {/* Кнопка отправки */}
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

                {/* Разделитель */}
                <Divider my={4} borderColor={borderColor} />

                {/* Кнопки OAuth */}
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

                {/* Переключение между входом и регистрацией */}
                <Button
                    variant="link"
                    w="100%"
                    mt={4}
                    onClick={toggleMode}
                    color={textColor}
                >
                    {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
                </Button>
            </MotionBox>

            {/* Область с землей */}
            <LandArea onDigComplete={handleDigComplete} isRegistrationVisible={isRegistrationVisible} />
        </Flex>
    );
};

export default Auth;