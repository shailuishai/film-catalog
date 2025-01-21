import React, { useState, useEffect } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm";

const AdminFilms = () => {
    const { films, isLoading, fetchFilms, handleCreateFilm, handleUpdateFilm, handleDeleteFilm } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFilm, setSelectedFilm] = useState(null);

    useEffect(() => {
        fetchFilms();
    }, [fetchFilms]);

    const handleEdit = (film) => {
        setSelectedFilm(film);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedFilm(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        if (selectedFilm) {
            await handleUpdateFilm(selectedFilm.id, data);
        } else {
            await handleCreateFilm(data);
        }
        setIsModalOpen(false);
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" minH="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    // Проверка, что films является массивом
    if (!Array.isArray(films)) {
        return (
            <Box>
                <p>Ошибка: Данные о фильмах не загружены или имеют неправильный формат.</p>
            </Box>
        );
    }

    return (
        <Box>
            <Button onClick={handleCreate} mb={4}>
                Create Film
            </Button>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Title</Th>
                        <Th>Release Date</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {films.map((film) => (
                        <Tr key={film.id}>
                            <Td>{film.title}</Td>
                            <Td>{new Date(film.release_date).toLocaleDateString()}</Td>
                            <Td>
                                <Button onClick={() => handleEdit(film)}>Edit</Button>
                                <Button onClick={() => handleDeleteFilm(film.id)}>Delete</Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <ModalForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedFilm}
            />
        </Box>
    );
};

export default AdminFilms;