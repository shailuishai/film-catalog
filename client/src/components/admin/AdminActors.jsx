import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, useToast } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";

const AdminActors = () => {
    const { actors, loading, error, deleteActor } = useAdmin();
    const toast = useToast();

    const handleDeleteActor = async (actorId) => {
        try {
            await deleteActor(actorId);
            toast({
                title: "Актер удален",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось удалить актера",
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
                        <Th>Имя</Th>
                        <Th>Описание</Th>
                        <Th>Действия</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {actors.map((actor) => (
                        <Tr key={actor.id}>
                            <Td>{actor.name}</Td>
                            <Td>{actor.description}</Td>
                            <Td>
                                <Button colorScheme="red" onClick={() => handleDeleteActor(actor.id)}>
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

export default AdminActors;