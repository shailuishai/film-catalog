import { Flex, Input, Button, useColorModeValue } from "@chakra-ui/react";

const Header = () => {
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
        </Flex>
    );
};

export default Header;