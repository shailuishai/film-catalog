import React from "react";
import { Box, Heading, Text, SimpleGrid, Flex, Button, useColorModeValue } from "@chakra-ui/react";
import Header from "../components/Header";
import { Link as RouterLink } from "react-router-dom";
import FilmCard from "../components/FilmCard";
import ActorCard from "../components/ActorCard";

const Home = () => {
    const films = [
        {
            id: 1,
            title: "Начало",
            poster_url: "https://filmposter.storage-173.s3hoster.by/default/",
            synopsis: "Вор, который крадет корпоративные секреты с использованием технологии совместного использования снов, получает задачу внедрить идею в сознание генерального директора.",
            release_date: "2010-07-16T00:00:00Z",
            runtime: "2ч 28м",
            producer: "Кристофер Нолан",
            created_at: "2023-10-01T12:00:00Z",
            avg_rating: 88,
            total_reviews: 1500,
            count_ratings_0_20: 50,
            count_ratings_21_40: 100,
            count_ratings_41_60: 200,
            count_ratings_61_80: 400,
            count_ratings_81_100: 750,
            genre_ids: [1, 2, 3],
            actor_ids: [101, 102, 103],
            genres: [
                { id: 1, name: "Боевик" },
                { id: 2, name: "Фантастика" },
                { id: 3, name: "Триллер" },
            ],
            actors: [
                { id: 101, name: "Леонардо ДиКаприо", avatar_url: "https://example.com/avatar1.jpg" },
                { id: 102, name: "Джозеф Гордон-Левитт", avatar_url: "https://example.com/avatar2.jpg" },
                { id: 103, name: "Эллиот Пейдж", avatar_url: "https://example.com/avatar3.jpg" },
            ],
        },
        {
            id: 2,
            title: "Темный рыцарь",
            poster_url: "https://filmposter.storage-173.s3hoster.by/default/",
            synopsis: "Когда угроза, известная как Джокер, появляется из своего таинственного прошлого, он сеет хаос и разрушение в Готэме. Темный рыцарь должен пройти одно из величайших психологических и физических испытаний, чтобы бороться с несправедливостью.",
            release_date: "2008-07-18T00:00:00Z",
            runtime: "2ч 32м",
            producer: "Кристофер Нолан",
            created_at: "2023-10-02T12:00:00Z",
            avg_rating: 90,
            total_reviews: 2000,
            count_ratings_0_20: 30,
            count_ratings_21_40: 80,
            count_ratings_41_60: 150,
            count_ratings_61_80: 500,
            count_ratings_81_100: 1240,
            genre_ids: [1, 4, 5],
            actor_ids: [104, 105, 106],
            genres: [
                { id: 1, name: "Боевик" },
                { id: 4, name: "Криминал" },
                { id: 5, name: "Драма" },
            ],
            actors: [
                { id: 104, name: "Кристиан Бэйл", avatar_url: "https://example.com/avatar4.jpg" },
                { id: 105, name: "Хит Леджер", avatar_url: "https://example.com/avatar5.jpg" },
                { id: 106, name: "Аарон Экхарт", avatar_url: "https://example.com/avatar6.jpg" },
            ],
        },
        {
            id: 3,
            title: "Интерстеллар",
            poster_url: "https://filmposter.storage-173.s3hoster.by/default/",
            synopsis: "Команда исследователей путешествует через червоточину в космосе, чтобы обеспечить выживание человечества.",
            release_date: "2014-11-07T00:00:00Z",
            runtime: "2ч 49м",
            producer: "Кристофер Нолан",
            created_at: "2023-10-03T12:00:00Z",
            avg_rating: 26,
            total_reviews: 1800,
            count_ratings_0_20: 40,
            count_ratings_21_40: 90,
            count_ratings_41_60: 180,
            count_ratings_61_80: 450,
            count_ratings_81_100: 1040,
            genre_ids: [2, 5, 6],
            actor_ids: [107, 108, 109],
            genres: [
                { id: 2, name: "Фантастика" },
                { id: 5, name: "Драма" },
                { id: 6, name: "Приключения" },
            ],
            actors: [
                { id: 107, name: "Мэттью Макконахи", avatar_url: "https://example.com/avatar7.jpg" },
                { id: 108, name: "Энн Хэтэуэй", avatar_url: "https://example.com/avatar8.jpg" },
                { id: 109, name: "Джессика Честейн", avatar_url: "https://example.com/avatar9.jpg" },
            ],
        },
    ];

    const actors = [
        {
            actor_id: 6,
            name: "Джейсон Стэйтем",
            wiki_url: "https://en.wikipedia.org/wiki/Jason_Statham",
            avatar_url: "https://actoravatar.storage-173.s3hoster.by/JasonStatham6",
        },
        {
            id: 1,
            name: "Кристиан Бэйл",
            avatar_url: "https://actoravatar.storage-173.s3hoster.by/default/",
            wiki_url: "https://en.wikipedia.org/wiki/Jason_Statham",
        },
        {
            id: 1,
            name: "Кристиан Бэйл",
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
            <Box py={4} px={{ base: 4, md: 8 }}>
                {/* Приветственное сообщение */}
                <Heading as="h1" size="xl" mb={4}>
                    Добро пожаловать на PatatoRates!
                </Heading>
                <Text fontSize="lg" mb={6}>
                    Откройте для себя лучшие фильмы, актеров и рецензии в нашем каталоге.
                </Text>

                {/* Ссылки на другие разделы */}
                <Flex mb={8} gap={4} flexWrap="wrap">
                    <Button as={RouterLink} to="/films">
                        Смотреть фильмы
                    </Button>
                    <Button as={RouterLink} to="/actors">
                        Смотреть актеров
                    </Button>
                    <Button as={RouterLink} to="/genres">
                        Смотреть жанры
                    </Button>
                </Flex>

                {/* Список популярных фильмов */}
                <Heading as="h2" size="lg" mb={4}>
                    Популярные фильмы
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4} mb={8}>
                    {films.map((film) => (
                        <FilmCard key={film.id} film={film} />
                    ))}
                </SimpleGrid>

                {/* Список популярных актеров */}
                <Heading as="h2" size="lg" mb={4}>
                    Популярные актеры
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                    {actors.map((actor) => (
                        <ActorCard key={actor.actor_id} actor={actor} />
                    ))}
                </SimpleGrid>
            </Box>
        </>
    );
};

export default Home;