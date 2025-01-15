import React, { useState, useEffect } from "react";
import { Box, Button, useColorModeValue } from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";

const MotionBox = motion(Box);

const LandArea = ({ onDigComplete, isRegistrationVisible, onRegisterClick }) => {
    const [digProgress, setDigProgress] = useState(0);
    const [digSpots, setDigSpots] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const controls = useAnimation();

    const handleDig = (e) => {
        if (digProgress < 100) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setDigSpots((prev) => [
                ...prev,
                { id: Math.random().toString(36).substring(7), x, y },
            ]);

            setDigProgress((prev) => {
                const newProgress = prev + 20;
                if (newProgress >= 100) {
                    // Используем setTimeout для асинхронного вызова onDigComplete
                    setTimeout(() => {
                        onDigComplete();
                    }, 0);
                    return 100;
                }
                return newProgress;
            });

            controls.start({
                opacity: 0,
                y: -20,
                transition: { duration: 0.5, ease: "easeInOut" },
            });
        }
    };

    return (
        <MotionBox
            position="fixed"
            left={0}
            bottom={0}
            width="100%"
            height="50vh"
            bgImage="/dirt.png"
            bgPosition="bottom"
            bgSize="cover"
            cursor={isHovered && digProgress < 100 ? "url(/iron_shovel.png), auto" : "auto"}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={digProgress < 100 ? handleDig : undefined}
        >
            {digSpots.map((spot) => (
                <MotionBox
                    key={spot.id}
                    position="absolute"
                    left={spot.x - 25}
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

            {isRegistrationVisible && (
                <MotionBox
                    position="absolute"
                    bottom={`${Math.random() * 50 + 25}%`}
                    left={`${Math.random() * 50 + 25}%`}
                    transform="rotate(-10deg)"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    <Button
                        variant="solid"
                        colorScheme="brand"
                        size="lg"
                        boxShadow="lg"
                        onClick={onRegisterClick}
                    >
                        Зарегистрироваться
                    </Button>
                </MotionBox>
            )}
        </MotionBox>
    );
};

export default LandArea;