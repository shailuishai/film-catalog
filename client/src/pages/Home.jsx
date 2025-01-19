import React from "react";
import {Box, Heading, Text, SimpleGrid, Flex, Button, useColorModeValue} from "@chakra-ui/react";
import Header from "../components/Header";
import { Link as RouterLink } from "react-router-dom";
import FilmCard from "../components/FilmCard"; // Предположим, что у вас есть компонент FilmCard
import ActorCard from "../components/ActorCard";
import { signIn } from '../services/userServices/authServices.js';

const Home = () => {

    const films = [
        {
            id: 1,
            title: "Inception",
            poster_url: "https://filmposter.storage-173.s3hoster.by/default/",
            synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
            release_date: "2010-07-16T00:00:00Z", // В формате ISO 8601
            runtime: "2h 28m",
            producer: "Christopher Nolan",
            created_at: "2023-10-01T12:00:00Z", // В формате ISO 8601
            avg_rating: 88,
            total_reviews: 1500,
            count_ratings_0_20: 50,
            count_ratings_21_40: 100,
            count_ratings_41_60: 200,
            count_ratings_61_80: 400,
            count_ratings_81_100: 750,
            genre_ids: [1, 2, 3], // ID жанров
            actor_ids: [101, 102, 103], // ID актеров
            genres: [
                { id: 1, name: "Action" },
                { id: 2, name: "Sci-Fi" },
                { id: 3, name: "Thriller" },
            ], // Полные данные жанров
            actors: [
                { id: 101, name: "Leonardo DiCaprio", avatar_url: "https://example.com/avatar1.jpg" },
                { id: 102, name: "Joseph Gordon-Levitt", avatar_url: "https://example.com/avatar2.jpg" },
                { id: 103, name: "Elliot Page", avatar_url: "https://example.com/avatar3.jpg" },
            ], // Полные данные актеров
        },
        {
            id: 2,
            title: "The Dark Knight",
            poster_url: "https://filmposter.storage-173.s3hoster.by/default/",
            synopsis: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham. The Dark Knight must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
            release_date: "2008-07-18T00:00:00Z", // В формате ISO 8601
            runtime: "2h 32m",
            producer: "Christopher Nolan",
            created_at: "2023-10-02T12:00:00Z", // В формате ISO 8601
            avg_rating: 90,
            total_reviews: 2000,
            count_ratings_0_20: 30,
            count_ratings_21_40: 80,
            count_ratings_41_60: 150,
            count_ratings_61_80: 500,
            count_ratings_81_100: 1240,
            genre_ids: [1, 4, 5], // ID жанров
            actor_ids: [104, 105, 106], // ID актеров
            genres: [
                { id: 1, name: "Action" },
                { id: 4, name: "Crime" },
                { id: 5, name: "Drama" },
            ], // Полные данные жанров
            actors: [
                { id: 104, name: "Christian Bale", avatar_url: "https://example.com/avatar4.jpg" },
                { id: 105, name: "Heath Ledger", avatar_url: "https://example.com/avatar5.jpg" },
                { id: 106, name: "Aaron Eckhart", avatar_url: "https://example.com/avatar6.jpg" },
            ], // Полные данные актеров
        },
        {
            id: 3,
            title: "Interstellar",
            poster_url: "https://filmposter.storage-173.s3hoster.by/default/",
            synopsis: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            release_date: "2014-11-07T00:00:00Z", // В формате ISO 8601
            runtime: "2h 49m",
            producer: "Christopher Nolan",
            created_at: "2023-10-03T12:00:00Z", // В формате ISO 8601
            avg_rating: 26,
            total_reviews: 1800,
            count_ratings_0_20: 40,
            count_ratings_21_40: 90,
            count_ratings_41_60: 180,
            count_ratings_61_80: 450,
            count_ratings_81_100: 1040,
            genre_ids: [2, 5, 6], // ID жанров
            actor_ids: [107, 108, 109], // ID актеров
            genres: [
                { id: 2, name: "Sci-Fi" },
                { id: 5, name: "Drama" },
                { id: 6, name: "Adventure" },
            ], // Полные данные жанров
            actors: [
                { id: 107, name: "Matthew McConaughey", avatar_url: "https://example.com/avatar7.jpg" },
                { id: 108, name: "Anne Hathaway", avatar_url: "https://example.com/avatar8.jpg" },
                { id: 109, name: "Jessica Chastain", avatar_url: "https://example.com/avatar9.jpg" },
            ], // Полные данные актеров
        },
    ];

    const actors = [
        {
            actor_id: 6,
            name: "Jason Statham",
            wiki_url: "https://en.wikipedia.org/wiki/Jason_Statham",
            avatar_url: "https://actoravatar.storage-173.s3hoster.by/JasonStatham6",
        },
        {
            id: 1,
            name: "Christian Bale",
            avatar_url: "https://actoravatar.storage-173.s3hoster.by/default/",
            wiki_url: "https://en.wikipedia.org/wiki/Jason_Statham",
        },
        {
            id: 1,
            name: "Christian Bale",
            avatar_url: "https://actoravatar.storage-173.s3hoster.by/default/",
            wiki_url: "https://en.wikipedia.org/wiki/Jason_Statham",
        },
    ];

    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const accentColor = useColorModeValue("accent.400", "accent.400");

    return (
        <>
        <Header />
        <Box py={4}>
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
                    <ActorCard key={actor.actor_id} actor={actor} />
                ))}
            </SimpleGrid>
        </Box>
        </>
    );
};

export default Home;