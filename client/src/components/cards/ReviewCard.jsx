import React from "react";
import { Box, Image, Text, Badge, Flex, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { getPosterUrl, getRatingColorScheme, formatReleaseDate } from "../../utils.jsx"; // Импортируем функции

const ReviewCard = ({ key, review, usePoster = false }) => {
    const imageUrl = usePoster ? getPosterUrl(review?.poster_url) : review?.avatar_url;
    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const boxShadow = useColorModeValue("lg", "dark-lg");

    return (
        <Box
            borderWidth="2px"
            borderRadius="md"
            overflow="hidden"
            maxW="300px"
            w="100%" // Добавьте фиксированную ширину
            h="auto" // Автоматическая высота
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
            <Box position="relative" width="100%" paddingTop="150%">
                <Image
                    src={imageUrl}
                    alt={review.review_text}
                    position="absolute"
                    top="0"
                    left="0"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    maxWidth="100%" // Ограничение по ширине
                    maxHeight="100%" // Ограничение по высоте
                />
            </Box>

            <Flex
                bg={bgColor}
                borderColor={borderColor}
                borderRadius="md"
                borderTopWidth="2px"
                mt="-16px"
                position="relative"
                zIndex="1"
                p={4}
                gap={4}
                flexDirection="column"
            >
                <Text fontWeight="bold" fontSize="lg">
                    Review
                </Text>
                <Text fontSize="sm" color={textColor} noOfLines={3}>
                    {review.review_text}
                </Text>
                <Flex align="center" flexWrap="wrap" gap={2}>
                    <Badge colorScheme={getRatingColorScheme(review.rating)} fontSize="sm">
                        Rating: {review.rating}%
                    </Badge>
                    <Badge colorScheme="teal" fontSize="sm">
                        Created: {formatReleaseDate(review.create_at)}
                    </Badge>
                </Flex>
            </Flex>
        </Box>
    );
};

export default ReviewCard;