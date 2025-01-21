import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, useToast } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";

const AdminGenres = () => {
    const { genres, loading, error, deleteGenre } = useAdmin();
    const toast = useToast();

    const handleDeleteGenre = async (genreId) => {
        try {
            await deleteGenre(genreId);
            toast({
                title: "Жанр удален",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось удалить жанр",
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
                        <Th>Действия</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {genres.map((genre) => (
                        <Tr key={genre.id}>
                            <Td>{genre.name}</Td>
                            <Td>
                                <Button colorScheme="red" onClick={() => handleDeleteGenre(genre.id)}>
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

export default AdminGenres;