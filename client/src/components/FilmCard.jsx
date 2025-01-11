import React from "react";
import { Box, Image, Text, Badge, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const FilmCard = ({ film }) => {
    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
            <Image src={film.poster} alt={film.title} />
            <Text fontWeight="bold" mt={2}>
                {film.title}
            </Text>
            <Text>{film.description}</Text>
            <Badge colorScheme="teal" mt={2}>
                Rating: {film.rating}
            </Badge>
            <Link as={RouterLink} to={`/films/${film.id}`} color="teal.500" mt={2} display="block">
                View Details
            </Link>
        </Box>
    );
};

export default FilmCard;