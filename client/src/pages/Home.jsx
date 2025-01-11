import React from "react";
import { Box, Heading, Text, SimpleGrid, Flex, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import FilmCard from "../components/FilmCard"; // Предположим, что у вас есть компонент FilmCard
import ActorCard from "../components/ActorCard"; // Предположим, что у вас есть компонент ActorCard

const Home = () => {
    // Пример данных для фильмов и актеров
    const films = [
        {
            id: 1,
            title: "Inception",
            poster: "https://via.placeholder.com/150",
            rating: 8.8,
            description: "A mind-bending thriller about dreams within dreams.",
        },
        {
            id: 2,
            title: "The Dark Knight",
            poster: "https://via.placeholder.com/150",
            rating: 9.0,
            description: "The epic battle between Batman and the Joker.",
        },
    ];

    const actors = [
        {
            id: 1,
            name: "Leonardo DiCaprio",
            avatar: "https://via.placeholder.com/150",
            bio: "Academy Award-winning actor.",
        },
        {
            id: 2,
            name: "Christian Bale",
            avatar: "https://via.placeholder.com/150",
            bio: "Known for his roles in The Dark Knight and American Psycho.",
        },
    ];

    return (
        <Box p={4}>
            {/* Приветственное сообщение */}
            <Heading as="h1" size="xl" mb={4}>
                Welcome to PatatoRates!
            </Heading>
            <Text fontSize="lg" mb={6}>
                Discover the best films, actors, and reviews in our catalog.
            </Text>

            {/* Ссылки на другие разделы */}
            <Flex mb={8} gap={4}>
                <Button as={RouterLink} to="/films" colorScheme="teal">
                    Browse Films
                </Button>
                <Button as={RouterLink} to="/actors" colorScheme="teal">
                    Browse Actors
                </Button>
                <Button as={RouterLink} to="/genres" colorScheme="teal">
                    Browse Genres
                </Button>
            </Flex>

            {/* Список популярных фильмов */}
            <Heading as="h2" size="lg" mb={4}>
                Popular Films
            </Heading>
            <SimpleGrid columns={[1, 2, 3]} spacing={4} mb={8}>
                {films.map((film) => (
                    <FilmCard key={film.id} film={film} />
                ))}
            </SimpleGrid>

            {/* Список популярных актеров */}
            <Heading as="h2" size="lg" mb={4}>
                Popular Actors
            </Heading>
            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                {actors.map((actor) => (
                    <ActorCard key={actor.id} actor={actor} />
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default Home;