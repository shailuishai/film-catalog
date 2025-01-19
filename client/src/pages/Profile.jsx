import React, { useState } from "react";
import {
    Box,
    Flex,
    Avatar,
    Text,
    Button,
    useColorModeValue,
    Input,
    FormControl,
    IconButton,
    Spinner,
    useToast,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext"; // Импортируем AuthContext
import { useProfile } from "../context/ProfileContext"; // Импортируем ProfileContext

const Profile = () => {
    const { logout } = useAuth(); // Используем AuthContext для выхода
    const { user, isLoading, updateProfile, deleteProfile } = useProfile(); // Используем ProfileContext для управления профилем
    const toast = useToast(); // Для уведомлений
    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const [editMode, setEditMode] = useState(null); // null, 'login', или 'avatar'
    const [login, setLogin] = useState(user?.login || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [resetAvatar, setResetAvatar] = useState(false);
    const avatarPrefix = useColorModeValue("_Light", "_Dark");

    // Обработчик изменения логина
    const handleLoginChange = (e) => {
        setLogin(e.target.value);
    };

    // Обработчик изменения аватара
    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    // Обработчик подтверждения изменений
    const handleSubmit = async () => {
        try {
            if (editMode === "login") {
                await updateProfile({ login }, null, false);
                toast({
                    title: "Логин обновлен",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (editMode === "avatar") {
                await updateProfile({}, avatarFile, resetAvatar);
                toast({
                    title: "Аватар обновлен",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
            setEditMode(null); // Выход из режима редактирования
            setAvatarFile(null); // Сброс файла аватара
            setResetAvatar(false); // Сброс флага сброса аватара
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось обновить данные",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Обработчик отмены изменений
    const handleCancel = () => {
        setEditMode(null); // Выход из режима редактирования
        setLogin(user?.login || ""); // Сброс логина к исходному значению
        setAvatarFile(null); // Сброс файла аватара
        setResetAvatar(false); // Сброс флага сброса аватара
    };

    // Обработчик удаления профиля
    const handleDeleteProfile = async () => {
        try {
            await deleteProfile();
            toast({
                title: "Профиль удален",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            logout(); // Выход после удаления профиля
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось удалить профиль",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Определение URL аватара
    const isDefaultAvatar = user?.avatar_url?.includes("default");
    const avatarUrl = user
        ? isDefaultAvatar
            ? `${user.avatar_url}512x512${avatarPrefix}.webp`
            : `${user.avatar_url}512x512.webp`
        : null;

    return (
        <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
            <Box
                p={8}
                borderWidth="1px"
                borderRadius="md"
                boxShadow="lg"
                bg={bgColor}
                color={textColor}
                textAlign="center"
                maxW="600px"
                w="100%"
            >
                {isLoading ? (
                    <Spinner size="xl" aria-label="Loading" />
                ) : (
                    <>
                        {/* Аватар */}
                        <Box position="relative" display="inline-block" mb={4}>
                            <Avatar size="2xl" src={avatarUrl} />
                            <IconButton
                                aria-label="Edit Avatar"
                                icon={<EditIcon />}
                                position="absolute"
                                bottom={0}
                                right={0}
                                size="sm"
                                onClick={() => setEditMode("avatar")}
                            />
                        </Box>

                        {/* Редактирование аватара */}
                        {editMode === "avatar" && (
                            <FormControl id="avatar" mb={4}>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                <Button
                                    colorScheme="red"
                                    onClick={() => setResetAvatar(true)}
                                    mt={2}
                                >
                                    Сбросить аватар
                                </Button>
                            </FormControl>
                        )}

                        {/* Редактирование логина */}
                        <Flex align="center" justify="center" mb={4}>
                            {editMode === "login" ? (
                                <Input
                                    type="text"
                                    value={login}
                                    onChange={handleLoginChange}
                                    mr={2}
                                />
                            ) : (
                                <>
                                    <Text fontSize="2xl" mr={2}>{user?.login}</Text>
                                    <IconButton
                                        aria-label="Edit Login"
                                        icon={<EditIcon />}
                                        onClick={() => setEditMode("login")}
                                    />
                                </>
                            )}
                        </Flex>

                        {/* Общие кнопки подтверждения и отмены */}
                        {editMode && (
                            <Flex justify="center" mb={4}>
                                <Button
                                    colorScheme="teal"
                                    onClick={handleSubmit}
                                    mr={2}
                                >
                                    <CheckIcon />
                                </Button>
                                <Button
                                    colorScheme="gray"
                                    onClick={handleCancel}
                                >
                                    <CloseIcon />
                                </Button>
                            </Flex>
                        )}

                        {/* Email (не редактируемый) */}
                        <Text fontSize="md" mb={4}>{user?.email}</Text>

                        {/* Кнопки удаления и выхода */}
                        <Button colorScheme="red" onClick={handleDeleteProfile} mb={4}>
                            Удалить профиль
                        </Button>
                        <Button colorScheme="brand" onClick={logout} leftIcon={<i className="fas fa-sign-out-alt"></i>}>
                            Выйти
                        </Button>
                    </>
                )}
            </Box>
        </Flex>
    );
};

export default Profile;