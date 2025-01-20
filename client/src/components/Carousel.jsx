import React, { useState } from "react";
import { Flex, IconButton, Box } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

const Carousel = ({ items, renderItem, itemsPerPage = 3, isDisabled = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prevIndex) => (prevIndex + itemsPerPage) % items.length);
    };

    const prev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - itemsPerPage + items.length) % items.length);
    };

    const visibleItems = items.slice(currentIndex, currentIndex + itemsPerPage);

    return (
        <Flex align="center" justify="center" position="relative" width="100%">
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
                h="100%"
                isDisabled={isDisabled} // Блокировка стрелки
            />

            {/* Контейнер для карточек с отступом */}
            <Flex
                gap={4}
                overflow="hidden"
                width="100%"
                height="80%"
                justify="center"
                py="5%"
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
                h="100%"
                right={0}
                zIndex={1}
                isDisabled={isDisabled} // Блокировка стрелки
            />
        </Flex>
    );
};

export default Carousel;