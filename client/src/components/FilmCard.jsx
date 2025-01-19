import React from "react";
import { Box, Image, Text, Badge, Flex, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const FilmCard = ({ film }) => {
    const posterPrefix = useColorModeValue("_Light", "_Dark");
    const isDefaultPoster = film?.poster_url?.includes("default");
    const posterUrl = film
        ? isDefaultPoster
            ? `${film.poster_url}800x1200${posterPrefix}.webp`
            : `${film.poster_url}`
        : null;

    // Цвета и тени
    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const boxShadow = useColorModeValue("lg", "dark-lg");

    // Определяем цвет рейтинга в зависимости от значения
    const getRatingColorScheme = (rating) => {
        if (rating >= 80) return "green"; // Высокий рейтинг
        if (rating >= 50) return "yellow"; // Средний рейтинг
        return "red"; // Низкий рейтинг
    };

    return (
        <Box
            as={RouterLink} // Делаем всю карточку кликабельной
            to={`/films/${film.id}`}
            borderWidth="2px"
            borderRadius="md"
            overflow="hidden"
            w="100%"
            maxW="300px"
            bg={bgColor}
            boxShadow={boxShadow}
            borderColor={borderColor}
            transition="transform 0.2s, box-shadow 0.2s"
            _hover={{
                transform: "scale(1.05)",
                boxShadow: "xl",
                textDecoration: "none", // Убираем подчеркивание при наведении
            }}
        >
            <Image
                src={posterUrl}
                alt={film.title}
                w="100%"
                h="450px" // Соотношение 2:3 (300px * 1.5 = 450px)
                objectFit="cover"
            />
            <Box p={4}>
                <Text fontWeight="bold" fontSize="lg" mb={2}>
                    {film.title}
                </Text>
                <Text fontSize="sm" color={textColor} noOfLines={3} mb={2}>
                    {film.synopsis}
                </Text>
                <Flex align="center" justify="space-between" mb={2}>
                    {/* Рейтинг с цветом, зависящим от значения */}
                    <Badge colorScheme={getRatingColorScheme(film.avg_rating)} fontSize="sm">
                        Rating: {film.avg_rating}%
                    </Badge>
                    {/* Время в том же стиле, что и рейтинг */}
                    <Badge colorScheme="teal" fontSize="sm">
                        Runtime: {film.runtime}
                    </Badge>
                </Flex>
            </Box>
        </Box>
    );
};

export default FilmCard;