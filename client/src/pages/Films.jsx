import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Input,
    Select,
    Button,
    SimpleGrid,
    Spinner,
    Text,
    useToast,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    RangeSlider, // Добавлен RangeSlider
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    VStack,
    HStack,
    useDisclosure,
    Collapse,
    IconButton,
    useColorModeValue,
    Checkbox,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import FilmCard from "../components/FilmCard";
import { getFilms, searchFilms } from "../services/filmServices";
import Header from "../components/Header.jsx";

const Films = () => {
    // Цветовые переменные
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const accentColor = useColorModeValue("accent.400", "accent.400");

    // Дефолтные жанры и актеры
    const defaultGenres = ["Action", "Comedy", "Drama", "Sci-Fi"];
    const allGenres = [
        "Action",
        "Comedy",
        "Drama",
        "Sci-Fi",
        "Horror",
        "Thriller",
        "Romance",
        "Adventure",
        "Fantasy",
    ];

    const defaultActors = ["Tom Hanks", "Leonardo DiCaprio", "Meryl Streep", "Brad Pitt"];
    const allActors = [
        "Tom Hanks",
        "Leonardo DiCaprio",
        "Meryl Streep",
        "Brad Pitt",
        "Angelina Jolie",
        "Johnny Depp",
        "Scarlett Johansson",
        "Robert Downey Jr.",
    ];

    // Состояние для выбранных жанров и актеров
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedActors, setSelectedActors] = useState([]);
    const [genreSearchQuery, setGenreSearchQuery] = useState("");
    const [actorSearchQuery, setActorSearchQuery] = useState("");

    // Раскрывающиеся списки
    const { isOpen: isGenreOpen, onToggle: onToggleGenre } = useDisclosure();
    const { isOpen: isActorOpen, onToggle: onToggleActor } = useDisclosure();
    const { isOpen: isRatingOpen, onToggle: onToggleRating } = useDisclosure();
    const { isOpen: isDurationOpen, onToggle: onToggleDuration } = useDisclosure();
    const { isOpen: isDateOpen, onToggle: onToggleDate } = useDisclosure();
    const { isOpen: isSortOpen, onToggle: onToggleSort } = useDisclosure();
    const { isOpen: isProducerOpen, onToggle: onToggleProducer } = useDisclosure();

    // Обработчики выбора жанров и актеров
    const handleGenreSelect = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter((g) => g !== genre));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
    };

    const handleActorSelect = (actor) => {
        if (selectedActors.includes(actor)) {
            setSelectedActors(selectedActors.filter((a) => a !== actor));
        } else {
            setSelectedActors([...selectedActors, actor]);
        }
    };

    // Фильтрация жанров и актеров по поисковому запросу
    const filteredGenres = allGenres.filter((genre) =>
        genre.toLowerCase().includes(genreSearchQuery.toLowerCase())
    );
    const filteredActors = allActors.filter((actor) =>
        actor.toLowerCase().includes(actorSearchQuery.toLowerCase())
    );

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
        sort_by: "", // По умолчанию без сортировки
        order: "desc", // Направление сортировки по умолчанию
        page: 1,
        page_size: 9,
        query: "",
    });

    const [pageInput, setPageInput] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    // Функция для очистки фильтров
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
        navigate("/films"); // Переход на страницу без фильтров
    };

    const cleanFilters = (filters) => {
        const cleanedFilters = { ...filters };

        const defaultFilters = {
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
            order: "asc",
            page: 1,
            page_size: 9,
            query: "",
        };

        Object.keys(cleanedFilters).forEach((key) => {
            if (
                cleanedFilters[key] === defaultFilters[key] ||
                cleanedFilters[key] === "" ||
                cleanedFilters[key] === null ||
                cleanedFilters[key] === undefined ||
                (Array.isArray(cleanedFilters[key]) && cleanedFilters[key].length === 0)
            ) {
                delete cleanedFilters[key];
            }
        });

        // Удаляем order, если sort_by не выбран
        if (!cleanedFilters.sort_by) {
            delete cleanedFilters.order;
        }

        // Форматируем длительность
        if (cleanedFilters.min_duration !== undefined) {
            cleanedFilters.min_duration = `${cleanedFilters.min_duration}m`;
        }
        if (cleanedFilters.max_duration !== undefined) {
            cleanedFilters.max_duration = `${cleanedFilters.max_duration}m`;
        }

        return cleanedFilters;
    };

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

    const handleSliderChange = (name, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const handleSearch = () => {
        const cleanedFilters = cleanFilters(filters);
        const queryParams = new URLSearchParams({
            ...cleanedFilters,
            page: cleanedFilters.page || 1,
            page_size: cleanedFilters.page_size || 9,
        }).toString();

        navigate(`/films?${queryParams}`);
    };

    const handlePageChange = (newPage) => {
        setFilters((prevFilters) => ({ ...prevFilters, page: newPage }));
        setPageInput(newPage.toString());

        const cleanedFilters = cleanFilters({ ...filters, page: newPage });
        const queryParams = new URLSearchParams({
            ...cleanedFilters,
            page: newPage,
            page_size: cleanedFilters.page_size || 9,
        }).toString();

        navigate(`/films?${queryParams}`);
    };

    const handlePageInputChange = (e) => {
        const value = e.target.value;
        setPageInput(value);
    };

    const handlePageInputSubmit = (e) => {
        e.preventDefault();
        const newPage = parseInt(pageInput);
        if (!isNaN(newPage) && newPage > 0) {
            handlePageChange(newPage);
        }
    };

    // Обработчик изменения направления сортировки
    const toggleSortOrder = () => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            order: prevFilters.order === "asc" ? "desc" : "asc",
        }));
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
            <Flex>
                {/* Основная часть с фильмами */}
                <Box flex={1} py={4} pr={4}>
                    {films.length === 0 ? (
                        <Text textAlign="center" fontSize="xl" color={textColor}>
                            Упс... таких фильмов еще не сделали
                        </Text>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            {films.map((film) => (
                                <FilmCard key={film.id} film={film} />
                            ))}
                        </SimpleGrid>
                    )}

                    {/* Пагинация */}
                    <Flex justify="center" mt={4}>
                        <HStack spacing={4}>
                            <Button
                                onClick={() => handlePageChange(filters.page - 1)}
                                isDisabled={filters.page === 1}
                            >
                                Назад
                            </Button>
                            <form onSubmit={handlePageInputSubmit}>
                                <Input
                                    type="number"
                                    value={pageInput}
                                    onChange={handlePageInputChange}
                                    width="80px"
                                    textAlign="center"
                                    fontWeight="bold"
                                    borderRadius="md"
                                    border="2px solid"
                                    borderColor={borderColor}
                                    boxShadow="lg"
                                    focusBorderColor={accentColor}
                                />
                            </form>
                            <Button
                                onClick={() => handlePageChange(filters.page + 1)}
                                isDisabled={films.length < filters.page_size}
                            >
                                Вперед
                            </Button>
                        </HStack>
                    </Flex>
                </Box>

                {/* Фильтры сбоку */}
                <Box width="300px" pl={4} py={4} borderLeft="2px solid" borderColor={borderColor}>
                    <VStack spacing={4} align="stretch">
                        {/* Кнопка очистки фильтров */}
                        <Button onClick={resetFilters} colorScheme="red">
                            Очистить фильтры
                        </Button>

                        {/* Сортировка */}
                        <Box>
                            <Flex justify="space-between" align="center">
                                <Text>Сортировка</Text>
                                <IconButton
                                    aria-label={isSortOpen ? "Скрыть" : "Показать"}
                                    icon={isSortOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    onClick={onToggleSort}
                                />
                            </Flex>
                            <Collapse in={isSortOpen}>
                                <VStack spacing={2} mt={2}>
                                    <Flex align="center" justify="space-between">
                                        <Select
                                            name="sort_by"
                                            value={filters.sort_by}
                                            onChange={handleFilterChange}
                                            borderRadius="md"
                                            border="2px solid"
                                            borderColor={borderColor}
                                            boxShadow="lg"
                                            focusBorderColor={accentColor}
                                            flex="1"
                                            mr={2}
                                        >
                                            <option value="">Без сортировки</option>
                                            <option value="avg_rating">По рейтингу</option>
                                            <option value="release_date">По дате выхода</option>
                                            <option value="runtime">По длительности</option>
                                        </Select>
                                        <IconButton
                                            aria-label="Toggle sort order"
                                            icon={filters.order === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                            onClick={toggleSortOrder}
                                            size="sm"
                                            colorScheme="accent"
                                            isDisabled={!filters.sort_by} // Отключаем, если сортировка не выбрана
                                        />
                                    </Flex>
                                </VStack>
                            </Collapse>
                        </Box>

                        {/* Жанры */}
                        <Box>
                            <Flex justify="space-between" align="center">
                                <Text>Жанры</Text>
                                <IconButton
                                    aria-label={isGenreOpen ? "Скрыть" : "Показать"}
                                    icon={isGenreOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    onClick={onToggleGenre}
                                />
                            </Flex>
                            <Collapse in={isGenreOpen}>
                                <Box p={4} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor}>
                                    <VStack align="start" spacing={2} mb={4}>
                                        <Text fontWeight="bold" color={textColor}>Жанры:</Text>
                                        <HStack wrap="wrap">
                                            {defaultGenres.map((genre) => (
                                                <Checkbox
                                                    key={genre}
                                                    isChecked={selectedGenres.includes(genre)}
                                                    onChange={() => handleGenreSelect(genre)}
                                                    colorScheme="accent"
                                                >
                                                    {genre}
                                                </Checkbox>
                                            ))}
                                        </HStack>
                                    </VStack>

                                    <Box mb={4}>
                                        <Button
                                            onClick={onToggleGenre}
                                            rightIcon={isGenreOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                            size="sm"
                                            colorScheme="accent"
                                        >
                                            {isGenreOpen ? "Скрыть" : "Показать все жанры"}
                                        </Button>
                                        <Collapse in={isGenreOpen}>
                                            <Box mt={2}>
                                                <Input
                                                    placeholder="Поиск жанров..."
                                                    value={genreSearchQuery}
                                                    onChange={(e) => setGenreSearchQuery(e.target.value)}
                                                    mb={2}
                                                    borderColor={borderColor}
                                                    focusBorderColor={accentColor}
                                                />
                                                <VStack align="start" spacing={2}>
                                                    {filteredGenres.map((genre) => (
                                                        <Checkbox
                                                            key={genre}
                                                            isChecked={selectedGenres.includes(genre)}
                                                            onChange={() => handleGenreSelect(genre)}
                                                            colorScheme="accent"
                                                        >
                                                            {genre}
                                                        </Checkbox>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        </Collapse>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" color={textColor}>Выбранные жанры:</Text>
                                        <HStack wrap="wrap">
                                            {selectedGenres.map((genre) => (
                                                <Box
                                                    key={genre}
                                                    bg="accent.100"
                                                    px={2}
                                                    py={1}
                                                    borderRadius="md"
                                                    m={1}
                                                    color={textColor}
                                                >
                                                    {genre}
                                                </Box>
                                            ))}
                                        </HStack>
                                    </Box>
                                </Box>
                            </Collapse>
                        </Box>

                        {/* Актеры */}
                        <Box>
                            <Flex justify="space-between" align="center">
                                <Text>Актеры</Text>
                                <IconButton
                                    aria-label={isActorOpen ? "Скрыть" : "Показать"}
                                    icon={isActorOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    onClick={onToggleActor}
                                />
                            </Flex>
                            <Collapse in={isActorOpen}>
                                <Box p={4} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor}>
                                    <VStack align="start" spacing={2} mb={4}>
                                        <Text fontWeight="bold" color={textColor}>Актеры:</Text>
                                        <HStack wrap="wrap">
                                            {defaultActors.map((actor) => (
                                                <Checkbox
                                                    key={actor}
                                                    isChecked={selectedActors.includes(actor)}
                                                    onChange={() => handleActorSelect(actor)}
                                                    colorScheme="accent"
                                                >
                                                    {actor}
                                                </Checkbox>
                                            ))}
                                        </HStack>
                                    </VStack>

                                    <Box mb={4}>
                                        <Button
                                            onClick={onToggleActor}
                                            rightIcon={isActorOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                            size="sm"
                                            colorScheme="accent"
                                        >
                                            {isActorOpen ? "Скрыть" : "Показать всех актеров"}
                                        </Button>
                                        <Collapse in={isActorOpen}>
                                            <Box mt={2}>
                                                <Input
                                                    placeholder="Поиск актеров..."
                                                    value={actorSearchQuery}
                                                    onChange={(e) => setActorSearchQuery(e.target.value)}
                                                    mb={2}
                                                    borderColor={borderColor}
                                                    focusBorderColor={accentColor}
                                                />
                                                <VStack align="start" spacing={2}>
                                                    {filteredActors.map((actor) => (
                                                        <Checkbox
                                                            key={actor}
                                                            isChecked={selectedActors.includes(actor)}
                                                            onChange={() => handleActorSelect(actor)}
                                                            colorScheme="accent"
                                                        >
                                                            {actor}
                                                        </Checkbox>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        </Collapse>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" color={textColor}>Выбранные актеры:</Text>
                                        <HStack wrap="wrap">
                                            {selectedActors.map((actor) => (
                                                <Box
                                                    key={actor}
                                                    bg="accent.100"
                                                    px={2}
                                                    py={1}
                                                    borderRadius="md"
                                                    m={1}
                                                    color={textColor}
                                                >
                                                    {actor}
                                                </Box>
                                            ))}
                                        </HStack>
                                    </Box>
                                </Box>
                            </Collapse>
                        </Box>

                        {/* Продюсер */}
                        <Box>
                            <Flex justify="space-between" align="center">
                                <Text>Продюсер</Text>
                                <IconButton
                                    aria-label={isProducerOpen ? "Скрыть" : "Показать"}
                                    icon={isProducerOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    onClick={onToggleProducer}
                                />
                            </Flex>
                            <Collapse in={isProducerOpen}>
                                <Input
                                    placeholder="Продюсер"
                                    name="producer"
                                    value={filters.producer}
                                    onChange={handleFilterChange}
                                    borderRadius="md"
                                    border="2px solid"
                                    borderColor={borderColor}
                                    boxShadow="lg"
                                    focusBorderColor={accentColor}
                                />
                            </Collapse>
                        </Box>

                        {/* Рейтинг */}
                        <Box>
                            <Flex justify="space-between" align="center">
                                <Text>Рейтинг</Text>
                                <IconButton
                                    aria-label={isRatingOpen ? "Скрыть" : "Показать"}
                                    icon={isRatingOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    onClick={onToggleRating}
                                />
                            </Flex>
                            <Collapse in={isRatingOpen}>
                                <VStack spacing={2} mt={2}>
                                    <HStack>
                                        <Text>От</Text>
                                        <Input
                                            value={filters.min_rating}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    min_rating: e.target.value,
                                                }))
                                            }
                                        />
                                        <Text>До</Text>
                                        <Input
                                            placeholder="До"
                                            value={filters.max_rating}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    max_rating: e.target.value,
                                                }))
                                            }
                                        />
                                    </HStack>
                                    <RangeSlider
                                        min={0}
                                        max={100}
                                        value={[filters.min_rating, filters.max_rating]}
                                        onChange={(val) => {
                                            setFilters((prev) => ({
                                                ...prev,
                                                min_rating: val[0],
                                                max_rating: val[1],
                                            }));
                                        }}
                                    >
                                        <RangeSliderTrack>
                                            <RangeSliderFilledTrack />
                                        </RangeSliderTrack>
                                        <RangeSliderThumb index={0} />
                                        <RangeSliderThumb index={1} />
                                    </RangeSlider>
                                </VStack>
                            </Collapse>
                        </Box>

                        {/* Длительность */}
                        <Box>
                            <Flex justify="space-between" align="center">
                                <Text>Длительность</Text>
                                <IconButton
                                    aria-label={isDurationOpen ? "Скрыть" : "Показать"}
                                    icon={isDurationOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    onClick={onToggleDuration}
                                />
                            </Flex>
                            <Collapse in={isDurationOpen}>
                                <VStack spacing={2} mt={2}>
                                    <HStack>
                                        <Text>От</Text>
                                        <Input
                                            placeholder="От"
                                            value={filters.min_duration}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    min_duration: e.target.value,
                                                }))
                                            }
                                        />
                                        <Text>До</Text>
                                        <Input
                                            placeholder="До"
                                            value={filters.max_duration}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    max_duration: e.target.value,
                                                }))
                                            }
                                        />
                                    </HStack>
                                    <RangeSlider
                                        min={0}
                                        max={300}
                                        value={[filters.min_duration, filters.max_duration]}
                                        onChange={(val) => {
                                            setFilters((prev) => ({
                                                ...prev,
                                                min_duration: val[0],
                                                max_duration: val[1],
                                            }));
                                        }}
                                    >
                                        <RangeSliderTrack>
                                            <RangeSliderFilledTrack />
                                        </RangeSliderTrack>
                                        <RangeSliderThumb index={0} />
                                        <RangeSliderThumb index={1} />
                                    </RangeSlider>
                                </VStack>
                            </Collapse>
                        </Box>

                        {/* Дата */}
                        <Box>
                            <Flex justify="space-between" align="center">
                                <Text>Дата выхода</Text>
                                <IconButton
                                    aria-label={isDateOpen ? "Скрыть" : "Показать"}
                                    icon={isDateOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    onClick={onToggleDate}
                                />
                            </Flex>
                            <Collapse in={isDateOpen}>
                                <VStack spacing={2} mt={2}>
                                    <HStack>
                                        <Text>От</Text>
                                        <Input
                                            type="date"
                                            value={filters.min_date}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    min_date: e.target.value,
                                                }))
                                            }
                                        />
                                    </HStack>
                                    <HStack>
                                        <Text>До</Text>
                                        <Input
                                            type="date"
                                            placeholder="До"
                                            value={filters.max_date}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    max_date: e.target.value,
                                                }))
                                            }
                                        />
                                    </HStack>
                                </VStack>
                            </Collapse>
                        </Box>

                        {/* Кнопка поиска */}
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