import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Spinner } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm.jsx";

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
                        <Th>Film</Th>
                        <Th>User</Th>
                        <Th>Rating</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {Array.isArray(reviews) && reviews.map((review) => (
                        <Tr key={review.id}>
                            <Td>{review.film?.title || "N/A"}</Td>
                            <Td>{review.user?.login || "N/A"}</Td>
                            <Td>{review.rating}</Td>
                            <Td>
                                <Button onClick={() => handleEdit(review)}>Edit</Button>
                                <Button onClick={() => handleDelete(review.id)}>Delete</Button>
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