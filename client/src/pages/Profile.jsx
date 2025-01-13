import React, {useEffect, useState} from "react";
import { Box, Flex, Avatar, Text, Button, useColorModeValue, Input, FormControl, FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, IconButton, useColorMode, Spinner } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext"; // Используем useAuth

const Profile = () => {
    const { user, isLoading, updateProfile, deleteProfile, logout } = useAuth();
    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [formData, setFormData] = useState({
        login: user?.login || "",
        email: user?.email || "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [resetAvatar, setResetAvatar] = useState(false);
    const avatarPrefix = useColorModeValue("_Light", "_Dark");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateProfile(formData, avatarFile, resetAvatar);
        onEditClose();
    };

    const handleDelete = async () => {
        await deleteProfile();
        onDeleteClose();
    };

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
                        <Avatar size="2xl" src={avatarUrl} mb={4} />
                        <Text fontSize="2xl" mb={2}>{user?.login}</Text>
                        <Text fontSize="md" mb={4}>{user?.email}</Text>

                        <Button colorScheme="teal" onClick={onEditOpen} mb={4}>
                            Редактировать профиль
                        </Button>

                        <Button colorScheme="red" onClick={onDeleteOpen} mb={4}>
                            Удалить профиль
                        </Button>

                        <Button colorScheme="brand" onClick={logout} leftIcon={<i className="fas fa-sign-out-alt"></i>}>
                            Выйти
                        </Button>

                        {/* Модальное окно для редактирования профиля */}
                        <Modal isOpen={isEditOpen} onClose={onEditClose}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>Редактировать профиль</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                    <FormControl id="login" mb={4}>
                                        <FormLabel>Логин</FormLabel>
                                        <Input
                                            type="text"
                                            name="login"
                                            value={formData.login}
                                            onChange={handleChange}
                                        />
                                    </FormControl>
                                    <FormControl id="email" mb={4}>
                                        <FormLabel>Email</FormLabel>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </FormControl>
                                    <FormControl id="avatar" mb={4}>
                                        <FormLabel>Аватар</FormLabel>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                        />
                                    </FormControl>
                                    <Button
                                        colorScheme="red"
                                        onClick={() => setResetAvatar(true)}
                                    >
                                        Сбросить аватар
                                    </Button>
                                </ModalBody>
                                <ModalFooter>
                                    <Button colorScheme="teal" mr={3} onClick={handleSubmit}>
                                        Сохранить
                                    </Button>
                                    <Button variant="ghost" onClick={onEditClose}>
                                        Отмена
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        {/* Модальное окно для удаления профиля */}
                        <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
                            <AlertDialogOverlay>
                                <AlertDialogContent>
                                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                        Удалить профиль
                                    </AlertDialogHeader>
                                    <AlertDialogBody>
                                        Вы уверены, что хотите удалить свой профиль? Это действие нельзя отменить.
                                    </AlertDialogBody>
                                    <AlertDialogFooter>
                                        <Button onClick={onDeleteClose}>Отмена</Button>
                                        <Button colorScheme="red" onClick={handleDelete} ml={3}>
                                            Удалить
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialogOverlay>
                        </AlertDialog>
                    </>
                )}
            </Box>
        </Flex>
    );
};

export default Profile;