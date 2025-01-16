import React from "react";
import {Box, Image, Text, Button} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ActorCard = ({ actor }) => {
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
            borderRadius="lg"
            borderWidth="2px"
            _hover={{
                "& > .overlay": {
                    opacity: 1,
                    "& > .text": {
                        animation: `${fadeIn} 0.3s ease-in-out`,
                    },
                },
            }}
        >
            <Image
                src={actor.avatar_url}
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
                alignItems="flex-start" // Текст будет ближе к верху
                justifyContent="center"
                pt={4} // Отступ сверху для текста
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