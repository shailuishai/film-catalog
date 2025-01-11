import React from "react";
import { Box, Image, Text, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const ActorCard = ({ actor }) => {
    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
            <Image src={actor.avatar} alt={actor.name} borderRadius="full" boxSize="150px" mx="auto" />
            <Text fontWeight="bold" mt={2} textAlign="center">
                {actor.name}
            </Text>
            <Text textAlign="center">{actor.bio}</Text>
            <Link as={RouterLink} to={`/actors/${actor.id}`} color="teal.500" mt={2} display="block" textAlign="center">
                View Profile
            </Link>
        </Box>
    );
};

export default ActorCard;