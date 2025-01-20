import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Spinner,
    Text,
    useToast,
    VStack,
    useColorModeValue,
    useDisclosure,
    IconButton,
    Button,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import FilmCard from "../components/cards/FilmCard.jsx";
import { getFilms, searchFilms } from "../services/filmServices";
import { getActors } from "../services/actorServices";
import { getGenres } from "../services/genreServices";
import Header from "../components/Header.jsx";
import Pagination from "../components/Pagination";
import Sorting from "../components/filters/Sorting.jsx";
import GenreFilter from "../components/filters/GenreFilter";
import ActorFilter from "../components/filters/ActorFilter";
import RatingFilter from "../components/filters/RatingFilter";
import DurationFilter from "../components/filters/DurationFilter";
import DateFilter from "../components/filters/DateFilter";

const Films = () => {
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");

    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedActors, setSelectedActors] = useState([]);
    const [genreSearchQuery, setGenreSearchQuery] = useState("");
    const [actorSearchQuery, setActorSearchQuery] = useState("");

    const { isOpen: isGenreOpen, onToggle: onToggleGenre } = useDisclosure();
    const { isOpen: isActorOpen, onToggle: onToggleActor } = useDisclosure();
    const { isOpen: isRatingOpen, onToggle: onToggleRating } = useDisclosure();
    const { isOpen: isDurationOpen, onToggle: onToggleDuration } = useDisclosure();
    const { isOpen: isDateOpen, onToggle: onToggleDate } = useDisclosure();
    const { isOpen: isSortOpen, onToggle: onToggleSort } = useDisclosure();
    const { isOpen: isProducerOpen, onToggle: onToggleProducer } = useDisclosure();

    const [allGenres, setAllGenres] = useState([]);
    const [allActors, setAllActors] = useState([]);

    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        genre_ids: [],
        actor_ids: [],
        producer: "",
        min_rating: 0,
        max_rating: 100,
        min_date: "",
        max_date: "",
        min_duration: 0,
        max_duration: 300,
        sort_by: "",
        order: "desc",
        page: 1,
        page_size: 9,
        query: "",
    });

    const [pageInput, setPageInput] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    useEffect(() => {
        const fetchGenresAndActors = async () => {
            try {
                const genresResponse = await getGenres();
                const actorsResponse = await getActors();
                setAllGenres(genresResponse.data || []);
                setAllActors(actorsResponse.data || []);
            } catch (err) {
                console.error("Ошибка при загрузке жанров и актеров:", err);
            }
        };

        fetchGenresAndActors();
    }, []);

    const handleGenreSelect = (genreId) => {
        if (selectedGenres.includes(genreId)) {
            setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
        } else {
            setSelectedGenres([...selectedGenres, genreId]);
        }
    };

    const handleActorSelect = (actorId) => {
        if (selectedActors.includes(actorId)) {
            setSelectedActors(selectedActors.filter((id) => id !== actorId));
        } else {
            setSelectedActors([...selectedActors, actorId]);
        }
    };

    const filteredGenres = allGenres.filter((genre) =>
        genre.name.toLowerCase().includes(genreSearchQuery.toLowerCase())
    );
    const filteredActors = allActors.filter((actor) =>
        actor.name.toLowerCase().includes(actorSearchQuery.toLowerCase())
    );

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const params = {};

        params.page = parseInt(queryParams.get("page")) || 1;
        params.page_size = 9;

        for (const [key, value] of queryParams.entries()) {
            if (key !== "page" && key !== "page_size") {
                params[key] = value;
            }
        }

        setFilters((prevFilters) => ({ ...prevFilters, ...params }));
        setPageInput(params.page.toString());
        fetchFilms(params);
    }, [location.search]);

    const fetchFilms = async (params) => {
        setLoading(true);
        try {
            let response;
            if (params.query) {
                response = await searchFilms(params.query);
            } else {
                response = await getFilms(params);
            }
            const filmsData = response.data || [];
            setFilms(Array.isArray(filmsData) ? filmsData : []);
            if (filmsData === null) {
                toast({
                    title: "Упс...",
                    description: "Таких фильмов еще не сделали",
                    status: "info",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error("Ошибка при получении фильмов:", err);
            setError(err.message);
            setFilms([]);
            toast({
                title: "Ошибка",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const toggleSortOrder = () => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            order: prevFilters.order === "asc" ? "desc" : "asc",
        }));
    };

    const handleSearch = () => {
        const cleanedFilters = {
            ...filters,
            genre_ids: selectedGenres,
            actor_ids: selectedActors,
        };

        const queryParams = new URLSearchParams();

        if (selectedGenres.length > 0) {
            queryParams.set("genre_ids", selectedGenres.join(","));
        }
        if (selectedActors.length > 0) {
            queryParams.set("actor_ids", selectedActors.join(","));
        }
        if (cleanedFilters.producer) {
            queryParams.set("producer", cleanedFilters.producer);
        }
        if (cleanedFilters.min_rating !== 0) {
            queryParams.set("min_rating", cleanedFilters.min_rating);
        }
        if (cleanedFilters.max_rating !== 100) {
            queryParams.set("max_rating", cleanedFilters.max_rating);
        }
        if (cleanedFilters.min_date) {
            queryParams.set("min_date", cleanedFilters.min_date);
        }
        if (cleanedFilters.max_date) {
            queryParams.set("max_date", cleanedFilters.max_date);
        }
        if (cleanedFilters.min_duration !== 0) {
            queryParams.set("min_duration", cleanedFilters.min_duration);
        }
        if (cleanedFilters.max_duration !== 300) {
            queryParams.set("max_duration", cleanedFilters.max_duration);
        }
        if (cleanedFilters.sort_by) {
            queryParams.set("sort_by", cleanedFilters.sort_by);
        }
        if (cleanedFilters.order !== "desc") {
            queryParams.set("order", cleanedFilters.order);
        }
        if (cleanedFilters.query) {
            queryParams.set("query", cleanedFilters.query);
        }

        queryParams.set("page", cleanedFilters.page || 1);
        queryParams.set("page_size", cleanedFilters.page_size || 9);

        navigate(`/films?${queryParams.toString()}`);
    };

    const handlePageChange = (newPage) => {
        setFilters((prevFilters) => ({ ...prevFilters, page: newPage }));
        setPageInput(newPage.toString());

        const cleanedFilters = {
            ...filters,
            page: newPage,
        };

        const queryParams = new URLSearchParams();

        if (selectedGenres.length > 0) {
            queryParams.set("genre_ids", selectedGenres.join(","));
        }
        if (selectedActors.length > 0) {
            queryParams.set("actor_ids", selectedActors.join(","));
        }
        if (cleanedFilters.producer) {
            queryParams.set("producer", cleanedFilters.producer);
        }
        if (cleanedFilters.min_rating !== 0) {
            queryParams.set("min_rating", cleanedFilters.min_rating);
        }
        if (cleanedFilters.max_rating !== 100) {
            queryParams.set("max_rating", cleanedFilters.max_rating);
        }
        if (cleanedFilters.min_date) {
            queryParams.set("min_date", cleanedFilters.min_date);
        }
        if (cleanedFilters.max_date) {
            queryParams.set("max_date", cleanedFilters.max_date);
        }
        if (cleanedFilters.min_duration !== 0) {
            queryParams.set("min_duration", cleanedFilters.min_duration);
        }
        if (cleanedFilters.max_duration !== 300) {
            queryParams.set("max_duration", cleanedFilters.max_duration);
        }
        if (cleanedFilters.sort_by) {
            queryParams.set("sort_by", cleanedFilters.sort_by);
        }
        if (cleanedFilters.order !== "desc") {
            queryParams.set("order", cleanedFilters.order);
        }

        queryParams.set("page", cleanedFilters.page || 1);
        queryParams.set("page_size", cleanedFilters.page_size || 9);

        navigate(`/films?${queryParams.toString()}`);
    };

    const resetFilters = () => {
        setFilters({
            genre_ids: [],
            actor_ids: [],
            producer: "",
            min_rating: 0,
            max_rating: 100,
            min_date: "",
            max_date: "",
            min_duration: 0,
            max_duration: 300,
            sort_by: "",
            order: "desc",
            page: 1,
            page_size: 9,
            query: "",
        });
        setSelectedGenres([]);
        setSelectedActors([]);
        setGenreSearchQuery("");
        setActorSearchQuery("");
        navigate("/films");
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

    return (
        <>
            <Header />
            <Flex direction={{ base: "column", md: "row" }} p={4}>
                {/* Основная часть с фильмами */}
                <Box flex={1} pr={{ base: 0, md: 4 }}>
                    {films.length === 0 ? (
                        <Text textAlign="center" fontSize="xl" color={textColor}>
                            Упс... таких фильмов еще не сделали
                        </Text>
                    ) : (
                        <Flex wrap="wrap" gap={6}>
                            {films.map((film) => (
                                <FilmCard key={film.id} film={film} />
                            ))}
                        </Flex>
                    )}

                    {/* Пагинация */}
                    <Pagination
                        currentPage={filters.page}
                        totalPages={Math.ceil(films.length / filters.page_size)}
                        onPageChange={handlePageChange}
                        filmsOnCurrentPage={films.length}
                    />
                </Box>

                {/* Фильтры сбоку */}
                <Box width={{ base: "100%", md: "300px" }} pl={{ base: 0, md: 4 }} pt={{ base: 4, md: 0 }}>
                    <VStack spacing={4} align="stretch">
                        <Button onClick={resetFilters} colorScheme="red">
                            Очистить фильтры
                        </Button>

                        <Sorting
                            sortBy={filters.sort_by}
                            order={filters.order}
                            onSortChange={(value) => setFilters((prev) => ({ ...prev, sort_by: value }))}
                            onOrderToggle={toggleSortOrder}
                        />

                        <GenreFilter
                            genres={allGenres}
                            selectedGenres={selectedGenres}
                            onGenreSelect={handleGenreSelect}
                            genreSearchQuery={genreSearchQuery}
                            setGenreSearchQuery={setGenreSearchQuery}
                        />

                        <ActorFilter
                            actors={allActors}
                            selectedActors={selectedActors}
                            onActorSelect={handleActorSelect}
                            actorSearchQuery={actorSearchQuery}
                            setActorSearchQuery={setActorSearchQuery}
                        />

                        <RatingFilter
                            minRating={filters.min_rating}
                            maxRating={filters.max_rating}
                            onRatingChange={(val) => setFilters((prev) => ({ ...prev, min_rating: val[0], max_rating: val[1] }))}
                        />

                        <DurationFilter
                            minDuration={filters.min_duration}
                            maxDuration={filters.max_duration}
                            onDurationChange={(val) => setFilters((prev) => ({ ...prev, min_duration: val[0], max_duration: val[1] }))}
                        />

                        <DateFilter
                            minDate={filters.min_date}
                            maxDate={filters.max_date}
                            onDateChange={(val) => setFilters((prev) => ({ ...prev, min_date: val[0], max_date: val[1] }))}
                        />

                        <Button onClick={handleSearch} colorScheme="accent">
                            Применить фильтры
                        </Button>
                    </VStack>
                </Box>
            </Flex>
        </>
    );
};

export default Films;