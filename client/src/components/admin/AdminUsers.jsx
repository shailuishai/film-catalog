import React, { useEffect, useState } from "react";
import {Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner, IconButton} from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm.jsx";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";

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
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Login</Th>
                        <Th>Email</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {users.map((user) => (
                        <Tr key={user.id}>
                            <Td>{user.login}</Td>
                            <Td>{user.email}</Td>
                            <Td width="60px" textAlign="right">
                                <IconButton
                                    aria-label="Delete"
                                    icon={<DeleteIcon />}
                                    onClick={() => handleDelete(user.id)}
                                    colorScheme="red"
                                    size="sm"
                                />
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