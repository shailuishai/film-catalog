import React, { useCallback, useState, useEffect } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Checkbox,
    Box,
    Image,
    Text,
    VStack,
    HStack,
    Collapse,
    IconButton,
    Flex,
    useColorModeValue,
    FormErrorMessage,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

const ModalForm = ({ isOpen, onClose, onSubmit, initialData, entity, genres, actors }) => {
    const [formData, setFormData] = useState({});
    const [posterFile, setPosterFile] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [resetAvatar, setResetAvatar] = useState(false);
    const [genreSearchQuery, setGenreSearchQuery] = useState("");
    const [actorSearchQuery, setActorSearchQuery] = useState("");
    const [isGenresOpen, setIsGenresOpen] = useState(false);
    const [isActorsOpen, setIsActorsOpen] = useState(false);
    const [runtimeError, setRuntimeError] = useState("");

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");
    const borderColor = useColorModeValue("gray.200", "brand.800");

    // Инициализация formData при изменении initialData
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({});
        }
    }, [initialData]);

    const validateRuntime = (value) => {
        const regex = /^\d+h\s*\d*m$|^\d+h$|^\d+m$/;
        return regex.test(value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "runtime") {
            setFormData({ ...formData, [name]: value });
            if (value && !validateRuntime(value)) {
                setRuntimeError("Формат должен быть: 2h 30m, 2h или 30m");
            } else {
                setRuntimeError("");
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    };

    const handleGenreSelect = (genreId) => {
        const updatedGenres = formData.genre_ids?.includes(genreId)
            ? formData.genre_ids.filter((id) => id !== genreId)
            : [...(formData.genre_ids || []), genreId];
        setFormData({ ...formData, genre_ids: updatedGenres });
    };

    const handleActorSelect = (actorId) => {
        const updatedActors = formData.actor_ids?.includes(actorId)
            ? formData.actor_ids.filter((id) => id !== actorId)
            : [...(formData.actor_ids || []), actorId];
        setFormData({ ...formData, actor_ids: updatedActors });
    };

    const handleSubmit = () => {
        if (formData.runtime && !validateRuntime(formData.runtime)) {
            setRuntimeError("Формат должен быть: 2h 30m, 2h или 30m");
            return;
        }
        const data = { ...formData };
        if (posterFile) {
            data.posterFile = posterFile;
        }
        if (avatarFile) {
            data.avatarFile = avatarFile;
        }
        if (resetAvatar) {
            data.reset_avatar = true;
        }
        onSubmit(data);
        onClose();
    };

    const handleClose = () => {
        setAvatarFile(null); // Сбрасываем avatarFile
        setResetAvatar(false); // Сбрасываем resetAvatar
        onClose(); // Закрываем модальное окно
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setPosterFile(acceptedFiles[0]);
            setAvatarFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const renderFields = () => {
        switch (entity) {
            case "film":
                return (
                    <>
                        <FormControl>
                            <FormLabel>Title</FormLabel>
                            <Input
                                name="title"
                                value={formData.title || ""}
                                onChange={handleChange}
                                isRequired
                            />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>Synopsis</FormLabel>
                            <Textarea
                                name="synopsis"
                                value={formData.synopsis || ""}
                                onChange={handleChange}
                                isRequired
                            />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>Release Date</FormLabel>
                            <Input
                                name="release_date"
                                type="date"
                                value={formData.release_date || ""}
                                onChange={handleChange}
                                isRequired
                            />
                        </FormControl>
                        <FormControl mt={4} isInvalid={!!runtimeError}>
                            <FormLabel>Runtime</FormLabel>
                            <Input
                                name="runtime"
                                value={formData.runtime || ""}
                                onChange={handleChange}
                                placeholder="Пример: 2h 30m, 2h или 30m"
                                isRequired
                            />
                            <FormErrorMessage>{runtimeError}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>Producer</FormLabel>
                            <Input
                                name="producer"
                                value={formData.producer || ""}
                                onChange={handleChange}
                                isRequired
                            />
                        </FormControl>

                        {/* Жанры */}
                        <FormControl mt={4}>
                            <Flex justify="space-between" align="center">
                                <FormLabel>Genres</FormLabel>
                                <IconButton
                                    aria-label={isGenresOpen ? "Скрыть" : "Показать"}
                                    icon={isGenresOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    onClick={() => setIsGenresOpen(!isGenresOpen)}
                                />
                            </Flex>
                            <Collapse in={isGenresOpen}>
                                <Box p={4} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor}>
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
                                                    isChecked={formData.genre_ids?.includes(genre.genre_id)}
                                                    onChange={() => handleGenreSelect(genre.genre_id)}
                                                    colorScheme="accent"
                                                    sx={{
                                                        "span[data-checked]": {
                                                            bg: "accent.400",
                                                            borderColor: "accent.400",
                                                        },
                                                    }}
                                                >
                                                    {genre.name}
                                                </Checkbox>
                                            ))}
                                    </VStack>
                                </Box>
                            </Collapse>
                        </FormControl>

                        {/* Актеры */}
                        <FormControl mt={4}>
                            <Flex justify="space-between" align="center">
                                <FormLabel>Actors</FormLabel>
                                <IconButton
                                    aria-label={isActorsOpen ? "Скрыть" : "Показать"}
                                    icon={isActorsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    onClick={() => setIsActorsOpen(!isActorsOpen)}
                                />
                            </Flex>
                            <Collapse in={isActorsOpen}>
                                <Box p={4} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor}>
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
                                                    isChecked={formData.actor_ids?.includes(actor.actor_id)}
                                                    onChange={() => handleActorSelect(actor.actor_id)}
                                                    colorScheme="accent"
                                                    sx={{
                                                        "span[data-checked]": {
                                                            bg: "accent.400",
                                                            borderColor: "accent.400",
                                                        },
                                                    }}
                                                >
                                                    {actor.name}
                                                </Checkbox>
                                            ))}
                                    </VStack>
                                </Box>
                            </Collapse>
                        </FormControl>

                        {/* Постер */}
                        <FormControl mt={4}>
                            <FormLabel>Poster</FormLabel>
                            <Box
                                {...getRootProps()}
                                p={4}
                                border="2px dashed"
                                borderColor={isDragActive ? "accent.400" : "gray.200"}
                                borderRadius="md"
                                textAlign="center"
                                cursor="pointer"
                            >
                                <input {...getInputProps()} />
                                {posterFile ? (
                                    <VStack>
                                        <Image
                                            src={URL.createObjectURL(posterFile)}
                                            alt="Poster"
                                            maxH="200px"
                                            mb={2}
                                        />
                                        <Text>{posterFile.name}</Text>
                                    </VStack>
                                ) : isDragActive ? (
                                    <Text>Drop the poster here...</Text>
                                ) : (
                                    <Text>Drag & drop a poster here, or click to select a file</Text>
                                )}
                            </Box>
                        </FormControl>
                        <FormControl mt={4}>
                            <Checkbox
                                name="remove_poster"
                                isChecked={formData.remove_poster || false}
                                onChange={handleCheckboxChange}
                            >
                                Remove Poster
                            </Checkbox>
                        </FormControl>
                    </>
                );
            case "actor":
                return (
                    <>
                        <FormControl isRequired>
                            <FormLabel>Name</FormLabel>
                            <Input
                                name="name"
                                value={formData.name || ""}
                                onChange={handleChange}
                            />
                        </FormControl>
                        <FormControl mt={4} isRequired>
                            <FormLabel>Wiki URL</FormLabel>
                            <Input
                                name="wiki_url"
                                value={formData.wiki_url || ""}
                                onChange={handleChange}
                            />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>Avatar</FormLabel>
                            <Box
                                {...getRootProps()}
                                p={4}
                                border="2px dashed"
                                borderColor={isDragActive ? "accent.400" : "gray.200"}
                                borderRadius="md"
                                textAlign="center"
                                cursor="pointer"
                            >
                                <input {...getInputProps()} />
                                {avatarFile ? (
                                    <VStack>
                                        <Image
                                            src={URL.createObjectURL(avatarFile)}
                                            alt="Avatar"
                                            maxH="200px"
                                            mb={2}
                                        />
                                        <Text>{avatarFile.name}</Text>
                                    </VStack>
                                ) : isDragActive ? (
                                    <Text>Drop the avatar here...</Text>
                                ) : (
                                    <Text>Drag & drop an avatar here, or click to select a file</Text>
                                )}
                            </Box>
                        </FormControl>
                        {initialData && (
                            <FormControl mt={4}>
                                <Checkbox
                                    name="reset_avatar"
                                    isChecked={resetAvatar}
                                    onChange={(e) => setResetAvatar(e.target.checked)}
                                >
                                    Reset Avatar
                                </Checkbox>
                            </FormControl>
                        )}
                    </>
                );
            case "genre":
                return (
                    <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input
                            name="name"
                            value={formData.name || ""}
                            onChange={handleChange}
                        />
                    </FormControl>
                );
            case "review":
                return (
                    <>
                        <FormControl isRequired>
                            <FormLabel>Rating</FormLabel>
                            <Input
                                name="rating"
                                type="number"
                                value={formData.rating || ""}
                                onChange={handleChange}
                                min={1}
                                max={10}
                            />
                        </FormControl>
                        <FormControl mt={4} isRequired>
                            <FormLabel>Review Text</FormLabel>
                            <Textarea
                                name="text"
                                value={formData.text || ""}
                                onChange={handleChange}
                            />
                        </FormControl>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
            <ModalContent bg={bgColor} color={textColor}>
                <ModalHeader>{initialData ? "Edit" : "Create"} {entity}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {renderFields()}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                        Save
                    </Button>
                    <Button variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ModalForm;