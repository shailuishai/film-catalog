import React from "react";
import { Box, Image, Text, Button, useColorModeValue } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const ActorCard = ({ key ,actor }) => {
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const boxShadow = useColorModeValue("lg", "dark-lg");
    const avatarPrefix = useColorModeValue("_Light", "_Dark");
    const isDefaultAvatar = actor?.avatar_url?.includes("default");
    const avatarUrl = actor
        ? isDefaultAvatar
            ? `${actor.avatar_url}512x512${avatarPrefix}.webp`
            : `${actor.avatar_url}`
        : null;

    return (
        <Button
            as="a"
            href={actor.wiki_url}
            target="_blank"
            rel="noopener noreferrer"
            position="relative"
            w="200px"
            h="200px"
            p={0}
            overflow="hidden"
            borderRadius="md"
            borderWidth="2px" // Возвращаем бордеры как были
            borderColor={borderColor}
            bg={useColorModeValue("white", "gray.800")} // Используем bg из темы
            boxShadow={boxShadow}
            transition="transform 0.2s, box-shadow 0.2s"
            _hover={{
                transform: "scale(1.05)",
                boxShadow: "xl",
                "& > .overlay": {
                    opacity: 1,
                    "& > .text": {
                        animation: `${fadeIn} 0.3s ease-in-out`,
                    },
                },
            }}
        >
            <Image
                src={avatarUrl}
                alt={actor.name}
                objectFit="cover"
                w="100%"
                h="100%"
            />
            <Box
                className="overlay"
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(0, 0, 0, 0.7)"
                opacity={0}
                transition="opacity 0.3s"
                display="flex"
                alignItems="flex-start"
                justifyContent="center"
                pt={4}
            >
                <Text
                    className="text"
                    color="white"
                    fontWeight="bold"
                    textAlign="center"
                >
                    {actor.name}
                </Text>
            </Box>
        </Button>
    );
};

export default ActorCard;