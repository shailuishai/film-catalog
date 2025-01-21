import React, { useState } from "react";
import { Box, Textarea, Input, Button, Flex, useColorModeValue, useToast } from "@chakra-ui/react";

const CreateReviewCard = ({ onSubmit, filmId }) => {
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(0);
    const toast = useToast();

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const boxShadow = useColorModeValue("lg", "dark-lg");
    const secondaryTextColor = useColorModeValue("gray.600", "gray.400");

    const handleSubmit = () => {
        const parsedRating = Number(rating);
        const parsedFilmId = Number(filmId);

        if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 100) {
            toast({
                title: "Ошибка",
                description: "Рейтинг должен быть числом от 0 до 100",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!reviewText.trim()) {
            toast({
                title: "Ошибка",
                description: "Текст отзыва не может быть пустым",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        onSubmit(parsedFilmId, parsedRating, reviewText);
    };

    return (
        <Box
            borderWidth="2px"
            borderRadius="md"
            overflow="hidden"
            maxW="300px"
            w="100%"
            h="auto"
            bg={bgColor}
            boxShadow={boxShadow}
            borderColor={borderColor}
            transition="transform 0.2s, box-shadow 0.2s"
            _hover={{
                transform: "scale(1.05)",
                boxShadow: "xl",
                textDecoration: "none",
            }}
        >
            <Box p={4}>
                {/* Поле для ввода текста отзыва */}
                <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Напишите ваш отзыв..."
                    mb={4}
                    fontSize="sm"
                    color={textColor}
                    _placeholder={{ color: secondaryTextColor }}
                />

                {/* Поле для ввода рейтинга */}
                <Flex align="center" mb={4}>
                    <Input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        placeholder="Рейтинг (0-100)"
                        min={0}
                        max={100}
                        mr={2}
                        fontSize="sm"
                        color={textColor}
                        _placeholder={{ color: secondaryTextColor }}
                    />
                    <Button
                        colorScheme="teal"
                        onClick={handleSubmit}
                        fontSize="sm"
                    >
                        Отправить
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

export default CreateReviewCard;