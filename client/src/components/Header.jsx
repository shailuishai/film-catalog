import { Flex, Input, Button, useColorModeValue } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const accentColor = useColorModeValue("accent.400", "accent.400");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // Получаем поисковый запрос из URL при монтировании компонента
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get("query") || "";
        setSearchQuery(query);
    }, [location.search]);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/films?query=${encodeURIComponent(searchQuery)}`);
        }
    };

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSearch();
                    }
                }}
            />
            <Button ml={4} onClick={handleSearch}>
                Search
            </Button>
        </Flex>
    );
};

export default Header;