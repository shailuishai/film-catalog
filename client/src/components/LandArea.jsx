import React, { useState } from "react";
import { Box, Button, useColorModeValue } from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";

const MotionBox = motion(Box);

const LandArea = ({ onDigComplete, isRegistrationVisible }) => {
    const [digProgress, setDigProgress] = useState(0);
    const [digSpots, setDigSpots] = useState([]); // Состояние для "откопанных" областей
    const controls = useAnimation();

    const handleDig = (e) => {
        if (digProgress < 100) {
            // Получаем координаты клика
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Добавляем новую "откопанную" область
            setDigSpots((prev) => [
                ...prev,
                { id: Math.random().toString(36).substring(7), x, y },
            ]);

            // Увеличиваем прогресс откапывания
            setDigProgress((prev) => prev + 20);

            // Анимация откапывания
            controls.start({
                opacity: 0,
                y: -20,
                transition: { duration: 0.5, ease: "easeInOut" },
            });
        }

        if (digProgress >= 100) {
            onDigComplete(); // Завершаем откапывание
        }
    };

    return (
        <MotionBox
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgImage="/dirt.png"
            bgSize="32px"
            bgPosition="center"
            cursor={digProgress < 100 ? "/iron_shovel.png, auto" : "auto"}
            onClick={digProgress < 100 ? handleDig : undefined} // Кликабельно только пока не откопано
        >
            {/* Откопанные области */}
            {digSpots.map((spot) => (
                <MotionBox
                    key={spot.id}
                    position="absolute"
                    left={spot.x - 25} // Центрируем область вокруг клика
                    top={spot.y - 25}
                    bg="transparent"
                    width="50px"
                    height="50px"
                    borderRadius="50%"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            ))}

            {/* Кнопка регистрации */}
            {isRegistrationVisible && (
                <MotionBox
                    position="absolute"
                    bottom={-100}
                    left="50%"
                    transform="translateX(-50%) rotate(-10deg)"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    <Button
                        variant="solid"
                        colorScheme="brand"
                        size="lg"
                        boxShadow="lg"
                        onClick={() => alert("Регистрация!")} // Обработчик клика
                    >
                        Зарегистрироваться
                    </Button>
                </MotionBox>
            )}
        </MotionBox>
    );
};

export default LandArea;