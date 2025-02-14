import React, { useEffect, useState } from "react";
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Flex,
    Spinner,
    IconButton,
    Checkbox,
    Text,
} from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const AdminFilms = () => {
    const { films, genres, actors, isLoading, fetchFilms, handleCreateFilm, handleUpdateFilm, handleDeleteFilm, handleMultiDeleteFilms } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFilm, setSelectedFilm] = useState(null);
    const [selectedFilms, setSelectedFilms] = useState([]);

    useEffect(() => {
        fetchFilms();
    }, []);

    const handleEdit = (film) => {
        setSelectedFilm(film); // Устанавливаем данные фильма для редактирования
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedFilm(null); // Очищаем данные для создания нового фильма
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        if (selectedFilm) {
            await handleUpdateFilm(selectedFilm.id, data); // Обновляем фильм
        } else {
            await handleCreateFilm(data); // Создаем новый фильм
        }
        setIsModalOpen(false);
    };

    const handleSelectFilm = (filmId) => {
        if (selectedFilms.includes(filmId)) {
            setSelectedFilms(selectedFilms.filter(id => id !== filmId));
        } else {
            setSelectedFilms([...selectedFilms, filmId]);
        }
    };

    const handleSelectAllFilms = () => {
        if (selectedFilms.length === films.length) {
            setSelectedFilms([]); // Снимаем выбор со всех фильмов
        } else {
            setSelectedFilms(films.map(film => film.id)); // Выбираем все фильмы
        }
    };

    const handleDeleteSelectedFilms = async () => {
        await handleMultiDeleteFilms(selectedFilms);
        setSelectedFilms([]);
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
            <Flex justify="space-between" mb={4}>
                <Button onClick={handleCreate}>
                    Create Film
                </Button>
                {selectedFilms.length > 0 && (
                    <Button onClick={handleDeleteSelectedFilms} colorScheme="red">
                        Delete Selected Films
                    </Button>
                )}
            </Flex>

            {!films || films.length === 0 ? ( // Проверка на null и пустой массив
                <Text textAlign="center" fontSize="lg" mt={4}>
                    Пока нет фильмов. Хотите создать новый?
                </Text>
            ) : (
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
                                isChecked={selectedFilms.length === films.length && films.length > 0}
                                isIndeterminate={selectedFilms.length > 0 && selectedFilms.length < films.length}
                                onChange={handleSelectAllFilms}
                            />
                        </Th>
                        <Th>ID</Th>
                        <Th>Title</Th>
                        <Th>Create Date</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {films.map((film) => (
                        <Tr key={film.id}>
                            <Td>
                                <Checkbox
                                    sx={{
                                        "span[data-checked]": {
                                            bg: "accent.400",
                                            borderColor: "accent.400",
                                        },
                                    }}
                                    colorScheme="accent"
                                    isChecked={selectedFilms.includes(film.id)}
                                    onChange={() => handleSelectFilm(film.id)}
                                />
                            </Td>
                            <Td>{film.id}</Td>
                            <Td>{film.title}</Td>
                            <Td>{new Date(film.created_at).toLocaleDateString()}</Td>
                            <Td width="120px" textAlign="right">
                                <IconButton
                                    aria-label="Edit"
                                    icon={<EditIcon />}
                                    onClick={() => handleEdit(film)}
                                    colorScheme="teal"
                                    size="sm"
                                    mr={2}
                                />
                                <IconButton
                                    aria-label="Delete"
                                    icon={<DeleteIcon />}
                                    onClick={() => handleDeleteFilm(film.id)}
                                    colorScheme="red"
                                    size="sm"
                                />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
                )}
            <ModalForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedFilm} // Передаем данные выбранного фильма
                entity="film"
                genres={genres || []}
                actors={actors || []}
            />
        </Box>
    );
};

export default AdminFilms;