import React, { useEffect, useState } from "react";
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
    Spinner, HStack, Spacer, useColorMode, Link,
} from "@chakra-ui/react";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import {
    FaFilm,
    FaUser,
    FaList,
    FaSignInAlt,
    FaAngleDoubleRight,
    FaAngleDoubleLeft, FaUserShield,
} from "react-icons/fa";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { isOpen, onToggle } = useDisclosure();
    const { user, isLoading } = useAuth();
    const { colorMode, toggleColorMode } = useColorMode();
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const accentColor = useColorModeValue("accent.400", "accent.400");
    const avatarPrefix = useColorModeValue("_Light", "_Dark");

    const isDefaultAvatar = user?.avatar_url?.includes("default");
    const avatarUrl = user
        ? isDefaultAvatar
            ? `${user.avatar_url}64x64${avatarPrefix}.webp`
            : `${user.avatar_url}64x64.webp`
        : null;

    return (
        <Flex
            flexDirection="column"
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
                    <Image src="/logo.svg" alt="Logo" boxSize="48px" />
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
                    onClick={() => setIsCollapsed(!isCollapsed)}
                />
            </Flex>

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
                    _activeLink={{
                        bg: "rgba(255, 165, 0, 0.1)",
                        color: accentColor,
                    }}
                >
                    <FaUser size={24} />
                    {!isCollapsed && "Актеры"}
                </Button>
            </VStack>
            <Spacer />
            <VStack
                spacing={4}
                align="start"
                py={4}
            >
                {user?.is_admin && (
                    <Button
                        as={RouterLink}
                        to="/admin"
                        variant="ghost"
                        h="48px"
                        w={isCollapsed ? "48px" : "100%"}
                        justifyContent={isCollapsed ? "center" : "start"}
                        gap={4}
                        p={isCollapsed ? 0 : 4}
                        color={textColor}
                        _activeLink={{
                            bg: "rgba(255, 165, 0, 0.1)",
                            color: accentColor,
                        }}
                    >
                        <FaUserShield size={24} />
                        {!isCollapsed && "Aдминка"}
                    </Button>
                )}
            </VStack>
            <Spacer />
            <VStack
                spacing={4}
                align="start"
                pt={4}
                borderTop="2px solid"
                borderColor={borderColor}
            >
                <Button
                    variant="ghost"
                    h="48px"
                    w={isCollapsed ? "48px" : "100%"}
                    justifyContent={isCollapsed ? "center" : "start"}
                    gap={4}
                    p={isCollapsed ? 0 : 4}
                    color={textColor}
                    onClick={toggleColorMode}
                >
                    {colorMode === "light" ? <MoonIcon boxSize={"24px"} /> : <SunIcon boxSize={"24px"} />}
                    {!isCollapsed && "Сменить тему"}
                </Button>
                {isLoading ? (
                    <Flex
                        justify="center"
                        h="48px"
                        w={isCollapsed ? "48px" : "100%"}
                    >
                        <Spinner size="lg" />
                    </Flex>
                ) : user ? (
                    <>
                        <Button
                            as={RouterLink}
                            to="/profile"
                            variant="ghost"
                            h="48px"
                            w={isCollapsed ? "48px" : "100%"}
                            justifyContent={isCollapsed ? "center" : "start"}
                            gap={4}
                            p={isCollapsed ? 0 : 4}
                            color={textColor}
                            _activeLink={{
                                bg: "rgba(255, 165, 0, 0.1)",
                                color: accentColor,
                            }}
                        >
                            <Avatar size="sm" src={avatarUrl} />
                            {!isCollapsed && `${user.login}`}
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
                        _activeLink={{
                            bg: "rgba(255, 165, 0, 0.1)",
                            color: accentColor,
                        }}
                    >
                        <FaSignInAlt size={24} />
                        {!isCollapsed && "Войти/Зарегистрироваться"}
                    </Button>
                )}
            </VStack>
        </Flex>
    );
};

export default Sidebar;