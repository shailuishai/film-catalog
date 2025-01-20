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
    Button,
    useDisclosure,
    Flex,
    useColorModeValue,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

const ActorFilter = ({
                         actors,
                         selectedActors,
                         onActorSelect,
                         actorSearchQuery,
                         setActorSearchQuery,
                     }) => {
    // Состояние для основного блока актеров
    const { isOpen: isMainOpen, onToggle: onToggleMain } = useDisclosure({ defaultIsOpen: false });

    // Состояние для блока "Показать всех актеров"
    const { isOpen: isAllActorsOpen, onToggle: onToggleAllActors } = useDisclosure({ defaultIsOpen: false });

    // Цветовые переменные
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");

    return (
        <Box>
            {/* Основной блок актеров */}
            <Flex justify="space-between" align="center">
                <Text>Актеры</Text>
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
                        <Text fontWeight="bold" color={textColor}>Актеры:</Text>
                        <HStack wrap="wrap">
                            {actors.slice(0, 4).map((actor) => (
                                <Checkbox
                                    key={actor.actor_id}
                                    isChecked={selectedActors.includes(actor.actor_id)}
                                    onChange={() => onActorSelect(actor.actor_id)}
                                    colorScheme="accent"
                                    sx={{
                                        "span[data-checked]": {
                                            bg: "accent.400", // Фон выбранного чекбокса
                                            borderColor: "accent.400", // Цвет границы выбранного чекбокса
                                        },
                                    }}
                                >
                                    {actor.name}
                                </Checkbox>
                            ))}
                        </HStack>
                    </VStack>

                    {/* Блок "Показать всех актеров" */}
                    <Box mb={4}>
                        <Button
                            onClick={onToggleAllActors}
                            rightIcon={isAllActorsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            size="sm"
                            colorScheme="accent"
                        >
                            {isAllActorsOpen ? "Скрыть" : "Показать всех актеров"}
                        </Button>
                        <Collapse in={isAllActorsOpen}>
                            <Box mt={2}>
                                <Input
                                    placeholder="Поиск актеров..."
                                    value={actorSearchQuery}
                                    onChange={(e) => setActorSearchQuery(e.target.value)}
                                    mb={2}
                                    borderColor={borderColor}
                                    focusBorderColor="accent.400"
                                />
                                <VStack align="start" spacing={2}>
                                    {actors
                                        .filter((actor) =>
                                            actor.name.toLowerCase().includes(actorSearchQuery.toLowerCase())
                                        )
                                        .map((actor) => (
                                            <Checkbox
                                                key={actor.actor_id}
                                                isChecked={selectedActors.includes(actor.actor_id)}
                                                onChange={() => onActorSelect(actor.actor_id)}
                                                colorScheme="accent"
                                                sx={{
                                                    "span[data-checked]": {
                                                        bg: "accent.400", // Фон выбранного чекбокса
                                                        borderColor: "accent.400", // Цвет границы выбранного чекбокса
                                                    },
                                                }}
                                            >
                                                {actor.name}
                                            </Checkbox>
                                        ))}
                                </VStack>
                            </Box>
                        </Collapse>
                    </Box>

                    {/* Выбранные актеры */}
                    <Box>
                        <Text fontWeight="bold" color={textColor}>Выбранные актеры:</Text>
                        <HStack wrap="wrap">
                            {selectedActors.map((actorId) => {
                                const actor = actors.find((a) => a.actor_id === actorId);
                                return (
                                    <Box
                                        key={actorId}
                                        bg="accent.100"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        m={1}
                                        color={textColor}
                                    >
                                        {actor?.name}
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

export default ActorFilter;