import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Flex, Button, useColorModeValue, Spinner } from "@chakra-ui/react";
import Header from "../components/Header";
import { Link as RouterLink } from "react-router-dom";
import FilmCard from "../components/FilmCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getFilms } from "../services/filmServices";

const Home = () => {
    const [popularFilms, setPopularFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        initialSlide: 0,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    useEffect(() => {
        const fetchPopularFilms = async () => {
            try {
                const params = {
                    sort_by: "avg_rating",
                    order: "desc",
                    page: 1,
                    page_size: 5,
                };
                const response = await getFilms(params);
                console.log("Данные с сервера:", response.data); // Логируем данные

                if (Array.isArray(response.data)) {
                    setPopularFilms(response.data);
                } else {
                    console.error("Ошибка: данные не являются массивом");
                    setError("Ошибка: данные не являются массивом");
                }
            } catch (err) {
                console.error("Ошибка при получении популярных фильмов:", err);
                setError(err.message);
            } finally {
                console.log("Загрузка завершена"); // Логируем завершение загрузки
                setLoading(false);
            }
        };

        fetchPopularFilms();
    }, []);

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");

    return (
        <>
            <Header />
            <Box py={4} px={{ base: 4, md: 8 }} bg={bgColor} color={textColor}>
                <Heading as="h1" size="xl" mb={4}>
                    Добро пожаловать на PatatoRates!
                </Heading>
                <Text fontSize="lg" mb={6}>
                    Откройте для себя лучшие фильмы, актеров и рецензии в нашем каталоге.
                </Text>

                <Flex mb={8} gap={4} flexWrap="wrap">
                    <Button as={RouterLink} to="/films" colorScheme="accent">
                        Смотреть фильмы
                    </Button>
                    <Button as={RouterLink} to="/actors" colorScheme="accent">
                        Смотреть актеров
                    </Button>
                </Flex>

                <Heading as="h2" size="lg" mb={4}>
                    Популярные фильмы
                </Heading>
                {loading ? (
                    <Flex justify="center" align="center" h="200px">
                        <Spinner size="xl" />
                    </Flex>
                ) : error ? (
                    <Text color="red.500">Ошибка: {error}</Text>
                ) : popularFilms.length > 0 ? (
                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: "1200px",
                            margin: "0 auto",
                            overflow: "hidden",
                            ".slick-slide > div": {
                                margin: "0 10px", // Отступы между слайдами
                            },
                            ".slick-list": {
                                margin: "0 -10px", // Компенсируем отступы для первого и последнего слайда
                            },
                        }}
                    >
                        <Slider {...sliderSettings}>
                            {popularFilms.map((film) => (
                                <Box key={film.id} sx={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}>
                                    <FilmCard film={film} />
                                </Box>
                            ))}
                        </Slider>
                    </Box>
                ) : (
                    <Text>Нет данных для отображения</Text>
                )}

                <Heading as="h2" size="lg" mb={4} mt={8}>
                    Популярные актеры
                </Heading>
                <Text fontSize="lg" mb={6}>
                    Скоро здесь появятся популярные актеры...
                </Text>
            </Box>
        </>
    );
};

export default Home;