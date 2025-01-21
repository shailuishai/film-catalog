import React, { useEffect, useState } from "react";
import {Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner, IconButton} from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm.jsx";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";

const AdminGenres = () => {
    const { genres, fetchGenres, deleteGenre } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchGenres().then(() => setIsLoading(false));
    }, [fetchGenres]);

    const handleDelete = async (id) => {
        await deleteGenre(id);
        fetchGenres();
    };

    const handleEdit = (genre) => {
        setSelectedGenre(genre);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedGenre(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        if (selectedGenre) {
            // Реализуйте обновление жанра
        } else {
            // Реализуйте создание жанра
        }
        setIsModalOpen(false);
        fetchGenres();
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
                Create Genre
            </Button>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Create Date</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {genres.map((genre) => (
                        <Tr key={genre.id}>
                            <Td>{genre.genre_id}</Td>
                            <Td>{genre.name}</Td>
                            <Td>{new Date(genre.created_at).toLocaleDateString()}</Td>
                            <Td width="120px" textAlign="right">
                                <IconButton
                                    aria-label="Edit"
                                    icon={<EditIcon />}
                                    onClick={() => handleEdit(genre)}
                                    colorScheme="teal"
                                    size="sm"
                                    mr={2}
                                />
                                <IconButton
                                    aria-label="Delete"
                                    icon={<DeleteIcon />}
                                    onClick={() => handleDelete(genre.id)}
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
                initialData={selectedGenre}
            />
        </Box>
    );
};

export default AdminGenres;