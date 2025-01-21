import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm.jsx";

const AdminUsers = () => {
    const { users, fetchUsers, deleteUser } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers().then(() => setIsLoading(false));
    }, [fetchUsers]);

    const handleDelete = async (id) => {
        await deleteUser(id);
        fetchUsers();
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        if (selectedUser) {
            // Реализуйте обновление пользователя
        } else {
            // Реализуйте создание пользователя
        }
        setIsModalOpen(false);
        fetchUsers();
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" minH="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <Box>
            <Button onClick={handleCreate} mb={4}>
                Create User
            </Button>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Login</Th>
                        <Th>Email</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {Array.isArray(users) && users.map((user) => (
                        <Tr key={user.id}>
                            <Td>{user.login}</Td>
                            <Td>{user.email}</Td>
                            <Td>
                                <Button onClick={() => handleEdit(user)}>Edit</Button>
                                <Button onClick={() => handleDelete(user.id)}>Delete</Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <ModalForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedUser}
            />
        </Box>
    );
};

export default AdminUsers;