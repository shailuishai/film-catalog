import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm.jsx";

const AdminActors = () => {
    const { actors, fetchActors, deleteActor } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActor, setSelectedActor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchActors().then(() => setIsLoading(false));
    }, [fetchActors]);

    const handleDelete = async (id) => {
        await deleteActor(id);
        fetchActors();
    };

    const handleEdit = (actor) => {
        setSelectedActor(actor);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedActor(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        if (selectedActor) {
            // Реализуйте обновление актера
        } else {
            // Реализуйте создание актера
        }
        setIsModalOpen(false);
        fetchActors();
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
                Create Actor
            </Button>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Wiki URL</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {actors.map((actor) => (
                        <Tr key={actor.id}>
                            <Td>{actor.name}</Td>
                            <Td>{actor.wikiUrl}</Td>
                            <Td>
                                <Button onClick={() => handleEdit(actor)}>Edit</Button>
                                <Button onClick={() => handleDelete(actor.id)}>Delete</Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <ModalForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedActor}
            />
        </Box>
    );
};

export default AdminActors;