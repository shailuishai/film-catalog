import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, useToast } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";

const AdminFilms = () => {
    const { films, loading, error, deleteFilm } = useAdmin();
    const toast = useToast();

    const handleDeleteFilm = async (filmId) => {
        try {
            await deleteFilm(filmId);
            toast({
                title: "Фильм удален",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось удалить фильм",
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
                        <Th>Название</Th>
                        <Th>Описание</Th>
                        <Th>Действия</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {films.map((film) => (
                        <Tr key={film.id}>
                            <Td>{film.title}</Td>
                            <Td>{film.description}</Td>
                            <Td>
                                <Button colorScheme="red" onClick={() => handleDeleteFilm(film.id)}>
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

export default AdminFilms;