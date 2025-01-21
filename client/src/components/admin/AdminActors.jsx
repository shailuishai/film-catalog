import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner, IconButton, Checkbox, Link } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm.jsx";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const AdminActors = () => {
    const { actors, fetchActors, deleteActor, handleMultiDeleteActors } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActor, setSelectedActor] = useState(null);
    const [selectedActors, setSelectedActors] = useState([]);
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

    const handleSelectActor = (actorId) => {
        if (selectedActors.includes(actorId)) {
            setSelectedActors(selectedActors.filter(id => id !== actorId));
        } else {
            setSelectedActors([...selectedActors, actorId]);
        }
    };

    const handleSelectAllActors = () => {
        if (selectedActors.length === actors.length) {
            setSelectedActors([]);
        } else {
            setSelectedActors(actors.map(actor => actor.actor_id));
        }
    };

    const handleDeleteSelectedActors = async () => {
        await handleMultiDeleteActors(selectedActors);
        setSelectedActors([]);
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
                    Create Actor
                </Button>
                {selectedActors.length > 0 && (
                    <Button onClick={handleDeleteSelectedActors} colorScheme="red">
                        Delete Selected Actors
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
                                isChecked={selectedActors.length === actors.length && actors.length > 0}
                                isIndeterminate={selectedActors.length > 0 && selectedActors.length < actors.length}
                                onChange={handleSelectAllActors}
                            />
                        </Th>
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Wiki URL</Th>
                        <Th>Create Date</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {actors.map((actor) => (
                        <Tr key={actor.actor_id}>
                            <Td>
                                <Checkbox
                                    sx={{
                                        "span[data-checked]": {
                                            bg: "accent.400",
                                            borderColor: "accent.400",
                                        },
                                    }}
                                    colorScheme="accent"
                                    isChecked={selectedActors.includes(actor.actor_id)}
                                    onChange={() => handleSelectActor(actor.actor_id)}
                                />
                            </Td>
                            <Td>{actor.actor_id}</Td>
                            <Td>{actor.name}</Td>
                            <Td><Link isExternal={true} href={actor.wiki_url}>{actor.wiki_url}</Link></Td>
                            <Td>{new Date(actor.created_at).toLocaleDateString()}</Td>
                            <Td width="120px" textAlign="right">
                                <IconButton
                                    aria-label="Edit"
                                    icon={<EditIcon />}
                                    onClick={() => handleEdit(actor)}
                                    colorScheme="teal"
                                    size="sm"
                                    mr={2}
                                />
                                <IconButton
                                    aria-label="Delete"
                                    icon={<DeleteIcon />}
                                    onClick={() => handleDelete(actor.actor_id)}
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
                initialData={selectedActor}
            />
        </Box>
    );
};

export default AdminActors;