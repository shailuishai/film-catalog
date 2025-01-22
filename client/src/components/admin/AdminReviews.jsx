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
    Text
} from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";
import ModalForm from "../ModalForm";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const AdminReviews = () => {
    const { reviews, fetchReviews, deleteReview, handleMultiDeleteReviews, handleCreateReview, handleUpdateReview } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [selectedReviews, setSelectedReviews] = useState([]);
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
            await handleUpdateReview(selectedReview.review_id, data);
        } else {
            await handleCreateReview(data);
        }
        setIsModalOpen(false);
        fetchReviews();
    };

    const handleSelectReview = (reviewId) => {
        if (selectedReviews.includes(reviewId)) {
            setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
        } else {
            setSelectedReviews([...selectedReviews, reviewId]);
        }
    };

    const handleSelectAllReviews = () => {
        if (selectedReviews.length === reviews.length) {
            setSelectedReviews([]);
        } else {
            setSelectedReviews(reviews.map(review => review.review_id));
        }
    };

    const handleDeleteSelectedReviews = async () => {
        await handleMultiDeleteReviews(selectedReviews);
        setSelectedReviews([]);
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
                    Create Review
                </Button>
                {selectedReviews.length > 0 && (
                    <Button onClick={handleDeleteSelectedReviews} colorScheme="red">
                        Delete Selected Reviews
                    </Button>
                )}
            </Flex>

            {!reviews || reviews.length === 0 ? ( // Проверка на null и пустой массив
                <Text textAlign="center" fontSize="xl" mt={4}>
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
                                isChecked={selectedReviews.length === reviews.length && reviews.length > 0}
                                isIndeterminate={selectedReviews.length > 0 && selectedReviews.length < reviews.length}
                                onChange={handleSelectAllReviews}
                            />
                        </Th>
                        <Th>ID</Th>
                        <Th>Film ID</Th>
                        <Th>User ID</Th>
                        <Th>Rating</Th>
                        <Th>Review Text</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {reviews.map((review) => (
                        <Tr key={review.review_id}>
                            <Td>
                                <Checkbox
                                    sx={{
                                        "span[data-checked]": {
                                            bg: "accent.400",
                                            borderColor: "accent.400",
                                        },
                                    }}
                                    colorScheme="accent"
                                    isChecked={selectedReviews.includes(review.review_id)}
                                    onChange={() => handleSelectReview(review.review_id)}
                                />
                            </Td>
                            <Td>{review.review_id}</Td>
                            <Td>{review.film_id}</Td>
                            <Td>{review.user_id}</Td>
                            <Td>{review.rating}</Td>
                            <Td>{review.text}</Td>
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
                                    onClick={() => handleDelete(review.review_id)}
                                    colorScheme="red"
                                    size="sm"
                                />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>)}
            <ModalForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedReview}
                entity="review"
            />
        </Box>
    );
};

export default AdminReviews;