import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, useToast } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";

const AdminReviews = () => {
    const { reviews, loading, error, deleteReview } = useAdmin();
    const toast = useToast();

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReview(reviewId);
            toast({
                title: "Отзыв удален",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось удалить отзыв",
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
                        <Th>Текст отзыва</Th>
                        <Th>Рейтинг</Th>
                        <Th>Действия</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {reviews.map((review) => (
                        <Tr key={review.id}>
                            <Td>{review.review_text}</Td>
                            <Td>{review.rating}</Td>
                            <Td>
                                <Button colorScheme="red" onClick={() => handleDeleteReview(review.id)}>
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

export default AdminReviews;