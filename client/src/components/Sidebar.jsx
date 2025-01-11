import React from "react";
import {
    Box,
    Flex,
    CloseButton,
    VStack,
    useDisclosure,
    Image,
    Text,
    Avatar,
    Divider,
    useColorModeValue,
    Button,
    IconButton,
    Spinner,
} from "@chakra-ui/react";
import { NavLink as RouterLink } from "react-router-dom";
import {
    FaFilm,
    FaUser,
    FaList,
    FaSignInAlt,
    FaAngleDoubleRight,
    FaAngleDoubleLeft,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => { // Принимаем пропсы
    const { isOpen, onToggle } = useDisclosure();
    const { user, isLoading, logout } = useAuth();

    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const accentColor = useColorModeValue("accent.400", "accent.400");

    return (
        <Box
            as="nav"
            position="fixed"
            left={4}
            top={4}
            bottom={4}
            h="calc(100vh - 32px)"
            w={{ base: isOpen ? (isCollapsed ? "100px" : "350px") : "0", md: isCollapsed ? "100px" : "350px" }}
            bg={bgColor}
            color={textColor}
            overflowX="hidden"
            transition="width 0.3s"
            zIndex={10}
            p={6}
            border="2px solid"
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="lg"
        >
            {/* Кнопка закрытия для мобильных устройств */}
            <Flex justify="flex-end" p={4} display={{ base: "flex", md: "none" }}>
                <CloseButton onClick={onToggle} />
            </Flex>

            {/* Логотип и кнопка сворачивания */}
            <Flex
                alignItems="center"
                pb={6}
                borderBottom="2px solid"
                borderColor={borderColor}
                position="relative"
                rowGap={6}
                flexDirection={isCollapsed ? "column" : "row"}
            >
                <Flex
                    as={RouterLink}
                    to="/"
                    gap={6}
                    p={0}
                    m={0}
                    _hover={{ textDecoration: "none" }}
                    alignItems="center"
                >
                    <Image src="./logo.svg" alt="Logo" boxSize="48px" />
                    {!isCollapsed && (
                        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                            PotatoRate
                        </Text>
                    )}
                </Flex>
                <IconButton
                    ml="auto"
                    aria-label="Collapse sidebar"
                    icon={isCollapsed ? <FaAngleDoubleRight size="24px" /> : <FaAngleDoubleLeft size="24px" />}
                    size="lg"
                    variant="ghost"
                    boxSize="48px"
                    _hover={{ bg: "rgba(255, 165, 0, 0.1)", color: accentColor }}
                    onClick={() => setIsCollapsed(!isCollapsed)} // Переключаем состояние
                />
            </Flex>

            {/* Основные ссылки */}
            <VStack
                spacing={4}
                align="start"
                py={4}
                borderBottom="2px solid"
                borderColor={borderColor}
            >
                <Button
                    as={RouterLink}
                    to="/films"
                    variant="ghost"
                    h="48px"
                    w={isCollapsed ? "48px" : "100%"}
                    justifyContent={isCollapsed ? "center" : "start"}
                    gap={4}
                    p={isCollapsed ? 0 : 4}
                    color={textColor}
                    _hover={{
                        bg: "rgba(255, 165, 0, 0.1)",
                        backdropFilter: "blur(4px)",
                        color: accentColor,
                        textDecoration: "none",
                    }}
                    _activeLink={{
                        bg: "rgba(255, 165, 0, 0.1)",
                        color: accentColor,
                    }}
                >
                    <FaFilm size={24} />
                    {!isCollapsed && "Фильмы"}
                </Button>
                <Button
                    as={RouterLink}
                    to="/actors"
                    variant="ghost"
                    h="48px"
                    w={isCollapsed ? "48px" : "100%"}
                    justifyContent={isCollapsed ? "center" : "start"}
                    gap={4}
                    p={isCollapsed ? 0 : 4}
                    color={textColor}
                    _hover={{
                        bg: "rgba(255, 165, 0, 0.1)",
                        backdropFilter: "blur(4px)",
                        color: accentColor,
                        textDecoration: "none",
                    }}
                    _activeLink={{
                        bg: "rgba(255, 165, 0, 0.1)",
                        color: accentColor,
                    }}
                >
                    <FaUser size={24} />
                    {!isCollapsed && "Актеры"}
                </Button>
                <Button
                    as={RouterLink}
                    to="/genres"
                    variant="ghost"
                    h="48px"
                    w={isCollapsed ? "48px" : "100%"}
                    justifyContent={isCollapsed ? "center" : "start"}
                    gap={4}
                    p={isCollapsed ? 0 : 4}
                    color={textColor}
                    _hover={{
                        bg: "rgba(255, 165, 0, 0.1)",
                        backdropFilter: "blur(4px)",
                        color: accentColor,
                        textDecoration: "none",
                    }}
                    _activeLink={{
                        bg: "rgba(255, 165, 0, 0.1)",
                        color: accentColor,
                    }}
                >
                    <FaList size={24} />
                    {!isCollapsed && "Жанры"}
                </Button>
            </VStack>

            {/* Профиль и кнопка Sign In/Sign Up или Logout */}
            <Box mt="auto" py={4}>
                {isLoading ? (
                    <Flex justify="center">
                        <Spinner size="lg" />
                    </Flex>
                ) : user ? (
                    <>
                        <Flex align="center" mb={4}>
                            <Avatar size="sm" src={user.avatar} name={user.name} mr={2} />
                            {!isCollapsed && (
                                <Text fontSize="md" color={textColor}>
                                    {user.name}
                                </Text>
                            )}
                        </Flex>
                        <Button
                            w="100%"
                            variant="ghost"
                            onClick={logout}
                        >
                            <FaSignInAlt size={24} />
                            {!isCollapsed && "Logout"}
                        </Button>
                    </>
                ) : (
                    <Button
                        as={RouterLink}
                        to="/auth"
                        variant="ghost"
                        h="48px"
                        w={isCollapsed ? "48px" : "100%"}
                        justifyContent={isCollapsed ? "center" : "start"}
                        gap={4}
                        p={isCollapsed ? 0 : 4}
                        color={textColor}
                        _hover={{
                            bg: "rgba(255, 165, 0, 0.1)",
                            backdropFilter: "blur(4px)",
                            color: accentColor,
                            textDecoration: "none",
                        }}
                        _activeLink={{
                            bg: "rgba(255, 165, 0, 0.1)",
                            color: accentColor,
                        }}
                    >
                        <FaSignInAlt size={24} />
                        {!isCollapsed && "Sign In/Sign Up"}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default Sidebar;