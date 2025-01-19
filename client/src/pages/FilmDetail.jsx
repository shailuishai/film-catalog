import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Spinner,
    Text,
    Image,
    Badge,
    VStack,
    HStack,
    useColorModeValue,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { getFilmById } from "../services/filmServices";
import { getPosterUrl, getRatingColorScheme, formatReleaseDate } from "../utils";
import RatingDistributionChart from "../components/RatingDistributionChart";
import ActorCard from "../components/ActorCard"; // Импортируем компонент ActorCard

const FilmDetail = () => {
    const { id } = useParams();
    const [film, setFilm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actors, setActors] = useState([]); // Состояние для актеров

    const posterPrefix = useColorModeValue("_Light", "_Dark");
    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const boxShadow = useColorModeValue("lg", "dark-lg");

    useEffect(() => {
        const fetchFilm = async () => {
            setLoading(true);
            try {
                const response = await getFilmById(id);
                if (response.status === "success") {
                    setFilm(response.data);
                    setActors(response.data.actors);
                } else {
                    setError("Фильм не найден");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFilm();
    }, [id]);

    if (loading) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Text color="red.500">{error}</Text>
            </Flex>
        );
    }

    if (!film) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Text>Фильм не найден</Text>
            </Flex>
        );
    }

    const posterUrl = getPosterUrl(film.poster_url, posterPrefix);

    return (
        <Box
            my={4}
            p={4}
            bg={bgColor}
            color={textColor}
            borderRadius="md"
            boxShadow={boxShadow}
            borderColor={borderColor}
            borderWidth="2px"
        >
            <Flex
                direction={{ base: "column", md: "row" }}
                gap={8}
                maxW="1200px"
                mx="auto"
                bg={bgColor}
            >
                {/* Постер */}
                <Box
                    position="relative"
                    width={{ base: "100%", md: "300px" }}
                    height="450px"
                    borderRadius="md"
                    overflow="hidden"
                    flexShrink={0}
                >
                    <Image
                        src={posterUrl}
                        alt={film.title}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                    />
                </Box>

                {/* Основная информация */}
                <Flex direction="column" flexGrow={1} gap={4}>
                    <Text fontSize="3xl" fontWeight="bold">
                        {film.title}
                    </Text>
                    <Text fontSize="lg">{film.synopsis}</Text>

                    <HStack spacing={4}>
                        <Badge colorScheme={getRatingColorScheme(film.avg_rating)} fontSize="md">
                            Рейтинг: {film.avg_rating}%
                        </Badge>
                        <Badge colorScheme="teal" fontSize="md">
                            Длительность: {film.runtime}
                        </Badge>
                        <Badge colorScheme="purple" fontSize="md">
                            Дата выпуска: {formatReleaseDate(film.release_date)}
                        </Badge>
                    </HStack>

                    <Text fontSize="md">
                        <strong>Продюсер:</strong> {film.producer}
                    </Text>

                    {/* Вывод жанров */}
                    <HStack spacing={2}>
                        <Text fontSize="md">
                            <strong>Жанры:</strong>
                        </Text>
                        {film.genres.map((genre) => (
                            <Badge key={genre.genre_id} colorScheme="blue">
                                {genre.name}
                            </Badge>
                        ))}
                    </HStack>

                    {film.total_reviews > 0 && (
                        <Text fontSize="md">
                            <strong>Количество отзывов:</strong> {film.total_reviews}
                        </Text>
                    )}
                </Flex>
            </Flex>

            {/* Карусель с актерами */}
            <Box mt={8}>
                <Text fontSize="2xl" fontWeight="bold" mb={4}>
                    Актеры
                </Text>
                <HStack spacing={4} overflowX="auto" py={4}>
                    {actors.map((actor) => (
                        <ActorCard key={actor.actor_id} actor={actor} />
                    ))}
                </HStack>
            </Box>

            <RatingDistributionChart data={film} />
        </Box>
    );
};

export default FilmDetail;