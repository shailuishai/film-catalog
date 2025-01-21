import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm.jsx";

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
                        <Th>Name</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {Array.isArray(genres) && genres.map((genre) => (
                        <Tr key={genre.id}>
                            <Td>{genre.name}</Td>
                            <Td>
                                <Button onClick={() => handleEdit(genre)}>Edit</Button>
                                <Button onClick={() => handleDelete(genre.id)}>Delete</Button>
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