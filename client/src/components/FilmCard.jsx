import React from "react";
import { Box, Image, Text, Badge, Flex, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { getPosterUrl, getRatingColorScheme, formatReleaseDate } from "../utils"; // Импортируем функции

const FilmCard = ({ film }) => {
    const posterPrefix = useColorModeValue("_Light", "_Dark");
    const posterUrl = getPosterUrl(film?.poster_url, posterPrefix); // Используем функцию

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const boxShadow = useColorModeValue("lg", "dark-lg");

    return (
        <Box
            as={RouterLink}
            to={`/films/${film.id}`}
            borderWidth="2px"
            borderRadius="md"
            overflow="hidden"
            maxW="300px"
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
                    src={posterUrl}
                    alt={film.title}
                    position="absolute"
                    top="0"
                    left="0"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                />
            </Box>

            <Box bg={bgColor} borderRadius="md" mt="-16px" position="relative" zIndex="1" p={4}>
                <Text fontWeight="bold" fontSize="lg" mb={2}>
                    {film.title}
                </Text>
                <Text fontSize="sm" color={textColor} noOfLines={3} mb={2}>
                    {film.synopsis}
                </Text>
                <Flex align="center" justify="space-between" mb={2}>
                    <Badge colorScheme={getRatingColorScheme(film.avg_rating)} fontSize="sm">
                        Rating: {film.avg_rating}%
                    </Badge>
                    <Badge colorScheme="teal" fontSize="sm">
                        Runtime: {film.runtime} min
                    </Badge>
                </Flex>
                <Flex align="center" justify="space-between">
                    <Badge colorScheme="purple" fontSize="sm">
                        Release: {formatReleaseDate(film.release_date)}
                    </Badge>
                </Flex>
            </Box>
        </Box>
    );
};

export default FilmCard;