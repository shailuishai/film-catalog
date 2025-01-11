import {Flex, Input, Button, useDisclosure, useColorMode, IconButton, useColorModeValue} from "@chakra-ui/react";
import { HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

const Header = () => {
    const { onToggle } = useDisclosure();
    const { colorMode, toggleColorMode } = useColorMode();
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const accentColor = useColorModeValue("accent.400", "accent.400");

    return (
        <Flex as="header" py={4} color={textColor} justifyContent="center" alignItems="center">
            <Input
                maxW="400px"
                minW="200px"
                placeholder="Найти фильм"
                border="2px solid"
                borderColor={borderColor}
                boxShadow="lg"
                focusBorderColor={accentColor}
            />
            <Button ml={4}>Search</Button>
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