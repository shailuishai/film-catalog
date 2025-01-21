import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Flex,
    Spinner,
    Text,
    Image,
    Badge,
    HStack,
    useColorModeValue,
    Wrap,
    WrapItem,
    Button,
    useToast,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { getFilmById } from "../services/filmServices";
import { getPosterUrl, getRatingColorScheme, formatReleaseDate } from "../utils";
import RatingDistributionChart from "../components/RatingDistributionChart";
import ActorCard from "../components/cards/ActorCard";
import ReviewCard from "../components/cards/ReviewCard";
import Carousel from "../components/Carousel";
import { useAuth } from "../context/AuthContext";
import CreateReviewCard from "../components/cards/CreateReviewCard.jsx";

const FilmDetail = () => {
    const { id } = useParams();
    const [film, setFilm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actors, setActors] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isCreatingReview, setIsCreatingReview] = useState(false);
    const { user, createReview, fetchReviewsByFilmId } = useAuth();
    const toast = useToast();
    const carouselRef = useRef(null); // Добавляем ref для карусели

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
                    const reviews = await fetchReviewsByFilmId(id);
                    setReviews(reviews);
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
    }, [id, fetchReviewsByFilmId]);

    const handleCreateReviewClick = () => {
        setIsCreatingReview(true);
        if (carouselRef.current) {
            carouselRef.current.resetIndex(); // Сбрасываем индекс карусели
        }
    };

    const handleSubmitReview = async (filmId, rating, reviewText) => {
        try {
            await createReview(filmId, rating, reviewText);
            toast({
                title: "Отзыв успешно добавлен",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setIsCreatingReview(false);
            const updatedReviews = await fetchReviewsByFilmId(id);
            setReviews(updatedReviews);
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось добавить отзыв",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

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
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb={2}>
                            Жанры:
                        </Text>
                        <Wrap spacing={2}>
                            {film.genres.map((genre) => (
                                <WrapItem key={genre.genre_id}>
                                    <Badge colorScheme="blue">{genre.name}</Badge>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Box>

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
                <Carousel
                    items={actors}
                    renderItem={(actor) => <ActorCard actor={actor} />}
                    itemsPerPage={1}
                />
            </Box>

            {/* Диаграмма и карусель с отзывами в одном Flex */}
            <Flex mt={8} direction={{ base: "column", md: "row" }} gap={8}>
                {/* Диаграмма распределения рейтингов */}
                <Box flex={1}>
                    <RatingDistributionChart data={film} />
                </Box>

                {/* Карусель с отзывами */}
                <Box flex={1}>
                    <Flex align="center" justify="space-between" mb={4}>
                        <Text fontSize="2xl" fontWeight="bold">
                            Отзывы ({reviews.length})
                        </Text>
                        {user ? (
                            <Button colorScheme="teal" size="sm" onClick={handleCreateReviewClick}>
                                Оставить отзыв
                            </Button>
                        ) : (
                            <Text fontSize="sm" color="gray.500">
                                Войдите, чтобы оставить отзыв
                            </Text>
                        )}
                    </Flex>
                    <Carousel
                        ref={carouselRef} // Передаем ref в карусель
                        items={isCreatingReview ? [{ id: "new-review", type: "form" }, ...reviews] : reviews}
                        renderItem={(item) => {
                            if (item.type === "form") {
                                return <CreateReviewCard onSubmit={handleSubmitReview} filmId={id} />;
                            }
                            return <ReviewCard review={item} />;
                        }}
                        itemsPerPage={1}
                        isDisabled={isCreatingReview}
                    />
                </Box>
            </Flex>
        </Box>
    );
};

export default FilmDetail;