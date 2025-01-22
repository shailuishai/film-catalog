import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text, Button, Flex, Spinner, IconButton, Checkbox } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm.jsx";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const AdminUsers = () => {
    const { users, fetchUsers, deleteUser, handleMultiDeleteUsers } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers().then(() => setIsLoading(false));
    }, []);

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

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSelectAllUsers = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(user => user.id));
        }
    };

    const handleDeleteSelectedUsers = async () => {
        await handleMultiDeleteUsers(selectedUsers);
        setSelectedUsers([]);
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
            <Flex justify="right" mb={4}>
                {selectedUsers.length > 0 && (
                    <Button onClick={handleDeleteSelectedUsers} colorScheme="red">
                        Delete Selected Users
                    </Button>
                )}
            </Flex>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>
                            <Checkbox
                                sx={{
                                    "span[data-checked]": {
                                        bg: "accent.400",
                                        borderColor: "accent.400",
                                    },
                                }}
                                colorScheme="accent"
                                isChecked={selectedUsers.length === users.length && users.length > 0}
                                isIndeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                                onChange={handleSelectAllUsers}
                            />
                        </Th>
                        <Th>ID</Th>
                        <Th>Login</Th>
                        <Th>Email</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {users.map((user) => (
                        <Tr key={user.id}>
                            <Td>
                                <Checkbox
                                    sx={{
                                        "span[data-checked]": {
                                            bg: "accent.400",
                                            borderColor: "accent.400",
                                        },
                                    }}
                                    colorScheme="accent"
                                    isChecked={selectedUsers.includes(user.id)}
                                    onChange={() => handleSelectUser(user.id)}
                                />
                            </Td>
                            <Td>{user.id}</Td>
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
        </Box>
    );
};

export default AdminUsers;