import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner, IconButton, Checkbox } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const AdminGenres = () => {
    const { genres, fetchGenres, deleteGenre, handleMultiDeleteGenres, handleCreateGenre, handleUpdateGenre } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);
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
            await handleUpdateGenre(selectedGenre.genre_id, data);
        } else {
            await handleCreateGenre(data);
        }
        setIsModalOpen(false);
        fetchGenres();
    };

    const handleSelectGenre = (genreId) => {
        if (selectedGenres.includes(genreId)) {
            setSelectedGenres(selectedGenres.filter(id => id !== genreId));
        } else {
            setSelectedGenres([...selectedGenres, genreId]);
        }
    };

    const handleSelectAllGenres = () => {
        if (selectedGenres.length === genres.length) {
            setSelectedGenres([]);
        } else {
            setSelectedGenres(genres.map(genre => genre.genre_id));
        }
    };

    const handleDeleteSelectedGenres = async () => {
        await handleMultiDeleteGenres(selectedGenres);
        setSelectedGenres([]);
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
                    Create Genre
                </Button>
                {selectedGenres.length > 0 && (
                    <Button onClick={handleDeleteSelectedGenres} colorScheme="red">
                        Delete Selected Genres
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
                                isChecked={selectedGenres.length === genres.length && genres.length > 0}
                                isIndeterminate={selectedGenres.length > 0 && selectedGenres.length < genres.length}
                                onChange={handleSelectAllGenres}
                            />
                        </Th>
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {genres.map((genre) => (
                        <Tr key={genre.genre_id}>
                            <Td>
                                <Checkbox
                                    sx={{
                                        "span[data-checked]": {
                                            bg: "accent.400",
                                            borderColor: "accent.400",
                                        },
                                    }}
                                    colorScheme="accent"
                                    isChecked={selectedGenres.includes(genre.genre_id)}
                                    onChange={() => handleSelectGenre(genre.genre_id)}
                                />
                            </Td>
                            <Td>{genre.genre_id}</Td>
                            <Td>{genre.name}</Td>
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
                                    onClick={() => handleDelete(genre.genre_id)}
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
                entity="genre"
            />
        </Box>
    );
};

export default AdminGenres;