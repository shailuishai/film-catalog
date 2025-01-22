import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Flex, IconButton, Box, useColorModeValue, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

const Carousel = forwardRef(({ items, renderItem, itemsPerPage = 1, isDisabled = false, emptyMessage = "Здесь пока нет данных" }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prevIndex) => (prevIndex + itemsPerPage) % items.length);
    };

    const prev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - itemsPerPage + items.length) % items.length);
    };

    useImperativeHandle(ref, () => ({
        resetIndex: () => {
            setCurrentIndex(0);
        },
    }));

    const visibleItems = items?.slice(currentIndex, currentIndex + itemsPerPage);

    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const accentColor = useColorModeValue("accent.400", "accent.400");

    // Если items пустой, показываем сообщение
    if (!items) {
        return (
            <Flex align="center" justify="center" width="100%" height="100%">
                <Text fontSize="lg" color={textColor}>
                    {emptyMessage}
                </Text>
            </Flex>
        );
    }

    return (
        <Flex align="center" justify="center" position="relative" width="100%" height="100%">
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
                height="100%"
                border="2px solid"
                borderColor={borderColor}
                bg={bgColor}
                color={textColor}
                _hover={{ bg: accentColor }}
            />

            {/* Контейнер для карточек с отступом */}
            <Flex
                gap={4}
                overflow="hidden"
                width="100%"
                height="100%"
                justify="center"
                align="center"
                position="relative"
            >
                <AnimatePresence mode="wait">
                    {visibleItems.map((item, index) => (
                        <MotionBox
                            key={item.id || index}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            width="100%"
                            height="100%"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
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
                height="100%"
                border="2px solid"
                borderColor={borderColor}
                bg={bgColor}
                color={textColor}
                _hover={{ bg: accentColor }}
            />
        </Flex>
    );
});

export default Carousel;