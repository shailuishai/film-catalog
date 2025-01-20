import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Flex, Button, useColorModeValue, Grid, Spinner, Center } from "@chakra-ui/react"; // Импортируем Spinner и Center из Chakra UI
import Header from "../components/Header";
import { Link as RouterLink } from "react-router-dom";
import { getFilms } from "../services/filmServices";
import { getActors } from "../services/actorServices";
import FilmCard from "../components/cards/FilmCard.jsx";
import ActorCard from "../components/cards/ActorCard.jsx";

const Home = () => {
    const [popularFilms, setPopularFilms] = useState([]);
    const [popularActors, setPopularActors] = useState([]);
    const [filmsLoading, setFilmsLoading] = useState(true); // Отдельное состояние для загрузки фильмов
    const [actorsLoading, setActorsLoading] = useState(true); // Отдельное состояние для загрузки актеров
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPopularFilms = async () => {
            try {
                const params = {
                    sort_by: "avg_rating",
                    order: "desc",
                    page: 1,
                    page_size: 3,
                };
                const response = await getFilms(params);
                if (Array.isArray(response.data)) {
                    setPopularFilms(response.data);
                } else {
                    setError("Ошибка: данные не являются массивом");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setFilmsLoading(false); // Загрузка фильмов завершена
            }
        };

        const fetchPopularActors = async () => {
            try {
                const params = {
                    sort_by: "movies_count",
                    order: "desc",
                    page: 1,
                    page_size: 5,
                };
                const response = await getActors(params);
                if (Array.isArray(response.data)) {
                    setPopularActors(response.data);
                } else {
                    setError("Ошибка: данные не являются массивом");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setActorsLoading(false); // Загрузка актеров завершена
            }
        };

        fetchPopularFilms();
        fetchPopularActors();
    }, []);

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");

    return (
        <>
            <Header />
            <Box py={4} bg={bgColor} color={textColor} width="100%">
                <Heading as="h1" size="xl" mb={4}>
                    Добро пожаловать на PatatoRates!
                </Heading>
                <Text fontSize="lg" mb={4}>
                    Откройте для себя лучшие фильмы, актеров и рецензии в нашем каталоге.
                </Text>

                <Flex mb={4} gap={4} flexWrap="wrap">
                    <Button as={RouterLink} to="/films" colorScheme="accent">
                        Смотреть фильмы
                    </Button>
                    <Button as={RouterLink} to="/actors" colorScheme="accent">
                        Смотреть актеров
                    </Button>
                </Flex>

                <Heading as="h1" size="xl" mb={4}>
                    Популярные фильмы
                </Heading>
                <Flex
                    gap={4}
                    mb={4}
                    justifyContent="space-between"
                >
                    {filmsLoading ? ( // Если фильмы загружаются, показываем спиннер
                        <Center width="100%">
                            <Spinner size="xl" />
                        </Center>
                    ) : (
                        popularFilms.map((film) => (
                            <FilmCard key={film.id} film={film} />
                        ))
                    )}
                </Flex>

                <Heading as="h1" size="xl" mb={4}>
                    Популярные актеры
                </Heading>
                <Flex

                    gap={4}
                    justifyContent="space-between"
                >
                    {actorsLoading ? ( // Если актеры загружаются, показываем спиннер
                        <Center width="100%">
                            <Spinner size="xl" />
                        </Center>
                    ) : (
                        popularActors.map((actor) => (
                            <ActorCard key={actor.actor_id} actor={actor} />
                        ))
                    )}
                </Flex>
            </Box>
        </>
    );
};

export default Home;