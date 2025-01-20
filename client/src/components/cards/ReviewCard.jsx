import React from "react";
import {Box, Image, Text, Badge, Flex, useColorModeValue, Spacer} from "@chakra-ui/react";
import { getPosterUrl, getRatingColorScheme, formatReleaseDate } from "../../utils";

const ReviewCard = ({ review, usePoster = false }) => {
    const imageUrl = usePoster ? getPosterUrl(review?.film_poster_url) : review?.user_avatar_url;
    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const boxShadow = useColorModeValue("lg", "dark-lg");
    const secondaryTextColor = useColorModeValue("gray.600", "gray.400");

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
            {usePoster ? (
                // Формат для общего использования (с постером фильма)
                <Flex>
                    <Box position="relative" width="50%" paddingTop="60%">
                        <Image
                            src={imageUrl}
                            alt={review.review_text}
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
                        <Badge colorScheme={getRatingColorScheme(review.rating)} fontSize="sm" mb={2}>
                            Rating: {review.rating}%
                        </Badge>
                        <Text fontSize="sm" color={textColor} noOfLines={5} mb={2}>
                            {review.review_text}
                        </Text>
                        <Text fontSize="xs" color={secondaryTextColor} textAlign="right">
                            {formatReleaseDate(review.created_at)}
                        </Text>
                    </Box>
                </Flex>
            ) : (
                // Формат для профиля фильма (с аватаром пользователя)
                <Box p={4}>
                    <Flex align="center" mb={4}>
                        <Box position="relative" width="40px" height="40px" borderRadius="full" overflow="hidden" mr={2}>
                            <Image
                                src={`${imageUrl}64x64.webp`}
                                alt={review.user_login}
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
                        <Text fontWeight="bold" fontSize="md" mr={2}>
                            {review.user_login}
                        </Text>
                        <Spacer/>
                        <Badge colorScheme={getRatingColorScheme(review.rating)} fontSize="sm" mb={2}>
                            Rating: {review.rating}%
                        </Badge>
                    </Flex>
                    <Text fontSize="sm" color={textColor} noOfLines={5} mb={2}>
                        {review.review_text}
                    </Text>
                    <Text fontSize="xs" color={secondaryTextColor} textAlign="right">
                        {formatReleaseDate(review.created_at)}
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default ReviewCard;