import {Button, Flex, HStack, Input, useToast} from "@chakra-ui/react";
import { useState } from "react";

const Pagination = ({ currentPage, totalPages, onPageChange, filmsOnCurrentPage }) => {
    const toast = useToast();
    const [pageInput, setPageInput] = useState(currentPage.toString());

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

    // Определяем, нужно ли блокировать кнопку "Вперед"
    const isNextButtonDisabled = filmsOnCurrentPage < 9;

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
                        borderColor="brand.800"
                        boxShadow="lg"
                        focusBorderColor="accent.400"
                    />
                </form>
                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    isDisabled={isNextButtonDisabled} // Блокируем кнопку, если это последняя страница или фильмов меньше 9
                >
                    Вперед
                </Button>
            </HStack>
        </Flex>
    );
};

export default Pagination;