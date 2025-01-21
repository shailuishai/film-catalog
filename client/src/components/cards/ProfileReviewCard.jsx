import React, { useState } from "react";
import {
    Box,
    Image,
    Text,
    Badge,
    Flex,
    useColorModeValue,
    IconButton,
    useToast,
    Textarea,
    Input,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { getPosterUrl, getRatingColorScheme, formatReleaseDate } from "../../utils";

const ProfileReviewCard = ({ review, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(review.review_text);
    const [editedRating, setEditedRating] = useState(review.rating);
    const toast = useToast();

    const avatarPrefix = useColorModeValue("_Light", "_Dark");
    const imageUrl = getPosterUrl(review?.film_poster_url, avatarPrefix);
    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const boxShadow = useColorModeValue("lg", "dark-lg");
    const secondaryTextColor = useColorModeValue("gray.600", "gray.400");

    const handleSave = () => {
        if (editedRating < 0 || editedRating > 100) {
            toast({
                title: "Ошибка",
                description: "Рейтинг должен быть от 0 до 100",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!editedText.trim()) {
            toast({
                title: "Ошибка",
                description: "Текст отзыва не может быть пустым",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        onEdit(review.review_id, editedText, editedRating);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedText(review.review_text);
        setEditedRating(review.rating);
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
            <Flex>
                <Box position="relative" width="50%" paddingTop="60%">
                    <Image
                        src={imageUrl}
                        alt={review.film_title}
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        maxWidth="100%"
                        maxHeight="100%"
                    />
                </Box>
                <Box width="60%" p={4}>
                    <Text fontWeight="bold" fontSize="lg" mb={2}>
                        {review.film_title}
                    </Text>
                    {isEditing ? (
                        <>
                            <Input
                                type="number"
                                value={editedRating}
                                onChange={(e) => setEditedRating(Number(e.target.value))}
                                placeholder="Рейтинг (0-100)"
                                min={0}
                                max={100}
                                mb={2}
                            />
                            <Textarea
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                placeholder="Напишите ваш отзыв..."
                                mb={2}
                            />
                            <Flex>
                                <IconButton
                                    aria-label="Save"
                                    icon={<CheckIcon />}
                                    onClick={handleSave}
                                    colorScheme="teal"
                                    mr={2}
                                />
                                <IconButton
                                    aria-label="Cancel"
                                    icon={<CloseIcon />}
                                    onClick={handleCancel}
                                    colorScheme="gray"
                                />
                            </Flex>
                        </>
                    ) : (
                        <>
                            <Badge colorScheme={getRatingColorScheme(review.rating)} fontSize="sm" mb={2}>
                                Rating: {review.rating}%
                            </Badge>
                            <Text fontSize="sm" color={textColor} noOfLines={5} mb={2}>
                                {review.review_text}
                            </Text>
                            <Text fontSize="xs" color={secondaryTextColor} textAlign="right">
                                {formatReleaseDate(review.created_at)}
                            </Text>
                            <Flex justify="flex-end" mt={2}>
                                <IconButton
                                    aria-label="Edit"
                                    icon={<EditIcon />}
                                    onClick={() => setIsEditing(true)}
                                    colorScheme="teal"
                                    size="sm"
                                    mr={2}
                                />
                                <IconButton
                                    aria-label="Delete"
                                    icon={<DeleteIcon />}
                                    onClick={() => onDelete(review.review_id)}
                                    colorScheme="red"
                                    size="sm"
                                />
                            </Flex>
                        </>
                    )}
                </Box>
            </Flex>
        </Box>
    );
};

export default ProfileReviewCard;