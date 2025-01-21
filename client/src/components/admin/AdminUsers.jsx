import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, useToast } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";

const AdminUsers = () => {
    const { users, loading, error, deleteUser } = useAdmin();
    const toast = useToast();

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            toast({
                title: "Пользователь удален",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось удалить пользователя",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (loading) return <Box>Загрузка...</Box>;
    if (error) return <Box>Ошибка: {error.message}</Box>;

    return (
        <Box>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Логин</Th>
                        <Th>Email</Th>
                        <Th>Действия</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {users.map((user) => (
                        <Tr key={user.id}>
                            <Td>{user.login}</Td>
                            <Td>{user.email}</Td>
                            <Td>
                                <Button colorScheme="red" onClick={() => handleDeleteUser(user.id)}>
                                    Удалить
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default AdminUsers;