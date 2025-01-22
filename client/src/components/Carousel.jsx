import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Flex, IconButton, Box, useColorModeValue } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

const Carousel = forwardRef(({ items, renderItem, itemsPerPage = 1, isDisabled = false }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prevIndex) => (prevIndex + itemsPerPage) % items.length);
    };

    const prev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - itemsPerPage + items.length) % items.length);
    };

    const resetIndex = () => {
        setCurrentIndex(0); // Сбрасываем индекс на 0
    };

    // Используем useImperativeHandle для предоставления метода resetIndex
    useImperativeHandle(ref, () => ({
        resetIndex,
    }));

    const visibleItems = items.slice(currentIndex, currentIndex + itemsPerPage);

    // Цвета в зависимости от темы
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const accentColor = useColorModeValue("accent.400", "accent.400");
    const avatarPrefix = useColorModeValue("_Light", "_Dark");

    return (
        <Flex align="center" justify="center" position="relative" width="100%" height="auto">
            {/* Стрелка "Назад" */}
            <IconButton
                aria-label="Previous"
                icon={<ChevronLeftIcon />}
                onClick={prev}
                size="sm"
                variant="ghost"
                position="absolute"
                left={0}
                zIndex={1}
                isDisabled={isDisabled || currentIndex === 0}
                height="100%" // Кнопка на всю высоту
                border="2px solid" // Обводка
                borderColor={borderColor} // Цвет обводки
                bg={bgColor} // Цвет фона
                color={textColor} // Цвет иконки
                _hover={{ bg: accentColor }} // Цвет фона при наведении
            />

            {/* Контейнер для карточек с отступом */}
            <Flex
                gap={4}
                overflow="hidden"
                width="100%"
                justify="center"
                py={4}
            >
                <AnimatePresence mode="wait">
                    {visibleItems.map((item, index) => (
                        <MotionBox
                            key={item.id || index}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderItem(item)}
                        </MotionBox>
                    ))}
                </AnimatePresence>
            </Flex>

            {/* Стрелка "Вперед" */}
            <IconButton
                aria-label="Next"
                icon={<ChevronRightIcon />}
                onClick={next}
                size="sm"
                variant="ghost"
                position="absolute"
                right={0}
                zIndex={1}
                isDisabled={isDisabled || currentIndex + itemsPerPage >= items.length}
                height="100%" // Кнопка на всю высоту
                border="2px solid" // Обводка
                borderColor={borderColor} // Цвет обводки
                bg={bgColor} // Цвет фона
                color={textColor} // Цвет иконки
                _hover={{ bg: accentColor }} // Цвет фона при наведении
            />
        </Flex>
    );
});

export default Carousel;