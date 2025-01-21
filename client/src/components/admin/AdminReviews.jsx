import React, { useEffect, useState } from "react";
import {Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner, IconButton} from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm.jsx";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";

const AdminReviews = () => {
    const { reviews, fetchReviews, deleteReview } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReviews().then(() => setIsLoading(false));
    }, [fetchReviews]);

    const handleDelete = async (id) => {
        await deleteReview(id);
        fetchReviews();
    };

    const handleEdit = (review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedReview(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        if (selectedReview) {
            // Реализуйте обновление отзыва
        } else {
            // Реализуйте создание отзыва
        }
        setIsModalOpen(false);
        fetchReviews();
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
                Create Review
            </Button>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Film ID</Th>
                        <Th>User ID</Th>
                        <Th>Rating</Th>
                        <Th>Create Date</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {reviews.map((review) => (
                        <Tr key={review.id}>
                            <Td>{review.film_id}</Td>
                            <Td>{review.user_id}</Td>
                            <Td>{review.rating}</Td>
                            <Td>{new Date(review.created_at).toLocaleDateString()}</Td>
                            <Td width="120px" textAlign="right">
                                <IconButton
                                    aria-label="Edit"
                                    icon={<EditIcon />}
                                    onClick={() => handleEdit(review)}
                                    colorScheme="teal"
                                    size="sm"
                                    mr={2}
                                />
                                <IconButton
                                    aria-label="Delete"
                                    icon={<DeleteIcon />}
                                    onClick={() => handleDelete(review.id)}
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
                initialData={selectedReview}
            />
        </Box>
    );
};

export default AdminReviews;