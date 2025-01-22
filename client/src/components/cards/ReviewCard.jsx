import React from "react";
import {Box, Image, Text, Badge, Flex, useColorModeValue, Spacer} from "@chakra-ui/react";
import { getAvatarUrl, getRatingColorScheme, formatReleaseDate } from "../../utils";

const ReviewCard = ({ review }) => {
    const avatarPrefix = useColorModeValue("_Light", "_Dark");
    const imageUrl = getAvatarUrl(review?.user_avatar_url, avatarPrefix);
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
            <Box p={4}>
                <Flex align="center" mb={4}>
                    <Box position="relative" width="40px" height="40px" borderRadius="full" overflow="hidden" mr={2}>
                        <Image
                            src={imageUrl}
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
                    <Text fontWeight="bold" fontSize="md">
                        {review.user_login}
                    </Text>
                    <Spacer></Spacer>
                    <Badge colorScheme={getRatingColorScheme(review.rating)} fontSize="sm">
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
        </Box>
    );
};

export default ReviewCard;