import { Flex, Input, Button, useDisclosure, useColorMode, IconButton } from "@chakra-ui/react";
import { HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

const Header = () => {
    const { onToggle } = useDisclosure();
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Flex as="header" p={4} color="white" justifyContent="space-between" alignItems="center">
            <Button
                display={{ base: "block", md: "none" }}
                onClick={onToggle}
                variant="ghost"
                colorScheme="whiteAlpha"
            >
                <HamburgerIcon />
            </Button>
            <Flex flex={1} ml={{ base: 2, md: 0 }}>
                <Input placeholder="Search films..." mr={2} />
                <Button colorScheme="teal">Search</Button>
            </Flex>
            <IconButton
                aria-label="Toggle theme"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                ml={2}
            />
        </Flex>
    );
};

export default Header;