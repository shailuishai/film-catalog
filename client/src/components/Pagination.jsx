import React from "react";
import { Button, HStack, Input, Flex, useToast } from "@chakra-ui/react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const toast = useToast();
    const [pageInput, setPageInput] = React.useState(currentPage.toString());

    const handlePageInputChange = (e) => {
        setPageInput(e.target.value);
    };

    const handlePageInputSubmit = (e) => {
        e.preventDefault();
        const newPage = parseInt(pageInput);
        if (!isNaN(newPage) && newPage > 0 && newPage <= totalPages) {
            onPageChange(newPage);
        } else {
            toast({
                title: "Ошибка",
                description: "Некорректный номер страницы",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Flex justify="center" mt={4}>
            <HStack spacing={4}>
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
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
                        borderColor="gray.200"
                        boxShadow="lg"
                        focusBorderColor="accent.400"
                    />
                </form>
                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                >
                    Вперед
                </Button>
            </HStack>
        </Flex>
    );
};

export default Pagination;