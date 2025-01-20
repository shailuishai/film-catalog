import React from "react";
import {
    Box,
    VStack,
    HStack,
    Checkbox,
    Input,
    Collapse,
    IconButton,
    Text,
    useDisclosure,
    Button,
    Flex,
    useColorModeValue,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

const GenreFilter = ({ genres, selectedGenres, onGenreSelect, genreSearchQuery, setGenreSearchQuery }) => {
    // Состояние для основного блока жанров
    const { isOpen: isMainOpen, onToggle: onToggleMain } = useDisclosure({ defaultIsOpen: false });

    // Состояние для блока "Показать все жанры"
    const { isOpen: isAllGenresOpen, onToggle: onToggleAllGenres } = useDisclosure({ defaultIsOpen: false });

    // Цветовые переменные
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");

    return (
        <Box>
            {/* Основной блок жанров */}
            <Flex justify="space-between" align="center">
                <Text>Жанры</Text>
                <IconButton
                    aria-label={isMainOpen ? "Скрыть" : "Показать"}
                    icon={isMainOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    size="sm"
                    onClick={onToggleMain}
                />
            </Flex>
            <Collapse in={isMainOpen}>
                <Box p={4} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor}>
                    <VStack align="start" spacing={2} mb={4}>
                        <Text fontWeight="bold" color={textColor}>Жанры:</Text>
                        <HStack wrap="wrap">
                            {genres.slice(0, 4).map((genre) => (
                                <Checkbox
                                    key={genre.genre_id}
                                    isChecked={selectedGenres.includes(genre.genre_id)}
                                    onChange={() => onGenreSelect(genre.genre_id)}
                                    colorScheme="accent"
                                    sx={{
                                        "span[data-checked]": {
                                            bg: "accent.400", // Фон выбранного чекбокса
                                            borderColor: "accent.400", // Цвет границы выбранного чекбокса
                                        },
                                    }}
                                >
                                    {genre.name}
                                </Checkbox>
                            ))}
                        </HStack>
                    </VStack>

                    {/* Блок "Показать все жанры" */}
                    <Box mb={4}>
                        <Button
                            onClick={onToggleAllGenres}
                            rightIcon={isAllGenresOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            size="sm"
                            colorScheme="accent"
                        >
                            {isAllGenresOpen ? "Скрыть" : "Показать все жанры"}
                        </Button>
                        <Collapse in={isAllGenresOpen}>
                            <Box mt={2}>
                                <Input
                                    placeholder="Поиск жанров..."
                                    value={genreSearchQuery}
                                    onChange={(e) => setGenreSearchQuery(e.target.value)}
                                    mb={2}
                                    borderColor={borderColor}
                                    focusBorderColor="accent.400"
                                />
                                <VStack align="start" spacing={2}>
                                    {genres
                                        .filter((genre) =>
                                            genre.name.toLowerCase().includes(genreSearchQuery.toLowerCase())
                                        )
                                        .map((genre) => (
                                            <Checkbox
                                                key={genre.genre_id}
                                                isChecked={selectedGenres.includes(genre.genre_id)}
                                                onChange={() => onGenreSelect(genre.genre_id)}
                                                colorScheme="accent"
                                                sx={{
                                                    "span[data-checked]": {
                                                        bg: "accent.400", // Фон выбранного чекбокса
                                                        borderColor: "accent.400", // Цвет границы выбранного чекбокса
                                                    },
                                                }}
                                            >
                                                {genre.name}
                                            </Checkbox>
                                        ))}
                                </VStack>
                            </Box>
                        </Collapse>
                    </Box>

                    {/* Выбранные жанры */}
                    <Box>
                        <Text fontWeight="bold" color={textColor}>Выбранные жанры:</Text>
                        <HStack wrap="wrap">
                            {selectedGenres.map((genreId) => {
                                const genre = genres.find((g) => g.genre_id === genreId);
                                return (
                                    <Box
                                        key={genreId}
                                        bg="accent.100"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        m={1}
                                        color={textColor}
                                    >
                                        {genre?.name}
                                    </Box>
                                );
                            })}
                        </HStack>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

export default GenreFilter;