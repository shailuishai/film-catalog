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
    RangeSlider,
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
import ActorCard from "../components/ActorCard";
import { getActors, searchActors } from "../services/actorServices";
import Header from "../components/Header.jsx";

const Actors = () => {
    // Цветовые переменные
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const accentColor = useColorModeValue("accent.400", "accent.400");

    // Состояние для фильтров
    const [actors, setActors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        name: "",
        created_at: "",
        min_year: "",
        max_year: "",
        min_movies_count: "",
        max_movies_count: "",
        sort_by: "",
        order: "desc",
        page: 1,
        page_size: 9,
    });

    const [pageInput, setPageInput] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    // Функция для очистки фильтров
    const resetFilters = () => {
        setFilters({
            name: "",
            created_at: "",
            min_year: "",
            max_year: "",
            min_movies_count: "",
            max_movies_count: "",
            sort_by: "",
            order: "desc",
            page: 1,
            page_size: 9,
        });
        navigate("/actors"); // Переход на страницу без фильтров
    };

    const cleanFilters = (filters) => {
        const cleanedFilters = { ...filters };

        const defaultFilters = {
            name: "",
            created_at: "",
            min_year: "",
            max_year: "",
            min_movies_count: "",
            max_movies_count: "",
            sort_by: "",
            order: "desc",
            page: 1,
            page_size: 9,
        };

        Object.keys(cleanedFilters).forEach((key) => {
            if (
                cleanedFilters[key] === defaultFilters[key] ||
                cleanedFilters[key] === "" ||
                cleanedFilters[key] === null ||
                cleanedFilters[key] === undefined
            ) {
                delete cleanedFilters[key];
            }
        });

        // Удаляем order, если sort_by не выбран
        if (!cleanedFilters.sort_by) {
            delete cleanedFilters.order;
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
        fetchActors(params);
    }, [location.search]);

    const fetchActors = async (params) => {
        setLoading(true);
        try {
            let response;
            if (params.query) {
                response = await searchActors(params.query);
            } else {
                response = await getActors(params);
            }
            const actorsData = response.data || [];
            setActors(Array.isArray(actorsData) ? actorsData : []);
            if (actorsData === null) {
                toast({
                    title: "Упс...",
                    description: "Таких актеров еще нет",
                    status: "info",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error("Ошибка при получении актеров:", err);
            setError(err.message);
            setActors([]);
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

    const handleSearch = () => {
        const cleanedFilters = cleanFilters(filters);
        const queryParams = new URLSearchParams({
            ...cleanedFilters,
            page: cleanedFilters.page || 1,
            page_size: cleanedFilters.page_size || 9,
        }).toString();

        navigate(`/actors?${queryParams}`);
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

        navigate(`/actors?${queryParams}`);
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
                {/* Основная часть с актерами */}
                <Box flex={1} py={4} pr={4}>
                    {actors.length === 0 ? (
                        <Text textAlign="center" fontSize="xl" color={textColor}>
                            Упс... таких актеров еще нет
                        </Text>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            {actors.map((actor) => (
                                <ActorCard key={actor.actor_id} actor={actor} />
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
                                isDisabled={actors.length < filters.page_size}
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
                                    aria-label="Toggle sort"
                                    icon={<ChevronDownIcon />}
                                    size="sm"
                                    onClick={() => {}}
                                />
                            </Flex>
                            <Collapse in={true}>
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
                                            <option value="name">По имени</option>
                                            <option value="created_at">По дате добавления</option>
                                            <option value="movies_count">По количеству фильмов</option>
                                        </Select>
                                        <IconButton
                                            aria-label="Toggle sort order"
                                            icon={filters.order === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                            onClick={toggleSortOrder}
                                            size="sm"
                                            colorScheme="accent"
                                            isDisabled={!filters.sort_by}
                                        />
                                    </Flex>
                                </VStack>
                            </Collapse>
                        </Box>

                        {/* Поиск по имени */}
                        <Box>
                            <Flex justify="space-between" align="center">
                                <Text>Имя актера</Text>
                                <IconButton
                                    aria-label="Toggle name search"
                                    icon={<ChevronDownIcon />}
                                    size="sm"
                                    onClick={() => {}}
                                />
                            </Flex>
                            <Collapse in={true}>
                                <Input
                                    placeholder="Поиск по имени"
                                    name="name"
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                    borderRadius="md"
                                    border="2px solid"
                                    borderColor={borderColor}
                                    boxShadow="lg"
                                    focusBorderColor={accentColor}
                                />
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

export default Actors;