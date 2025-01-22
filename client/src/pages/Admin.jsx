import React, {useEffect} from "react";
import { Box, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, useColorModeValue } from "@chakra-ui/react";
import { useAdmin } from "../context/AdminContext";
import AdminFilms from "../components/admin/AdminFilms";
import AdminActors from "../components/admin/AdminActors";
import AdminGenres from "../components/admin/AdminGenres";
import AdminReviews from "../components/admin/AdminReviews";
import AdminUsers from "../components/admin/AdminUsers";

const Admin = () => {
    const { fetchDataIfAdmin } = useAdmin();

    useEffect(() => {
        fetchDataIfAdmin();
    }, [fetchDataIfAdmin]);

    const bgColor = useColorModeValue("white", "brand.900");
    const textColor = useColorModeValue("brand.900", "white");

    return (
        <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
            <Box p={6} borderWidth="2px" borderRadius="md" boxShadow="lg" bg={bgColor} color={textColor} maxW="1200px" w="100%">
                <Tabs isFitted variant="enclosed" colorScheme="brand"> {/* Используем colorScheme вместо activeColor */}
                    <TabList mb="1em">
                        <Tab>Фильмы</Tab>
                        <Tab>Актеры</Tab>
                        <Tab>Жанры</Tab>
                        <Tab>Отзывы</Tab>
                        <Tab>Пользователи</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <AdminFilms />
                        </TabPanel>
                        <TabPanel>
                            <AdminActors />
                        </TabPanel>
                        <TabPanel>
                            <AdminGenres />
                        </TabPanel>
                        <TabPanel>
                            <AdminReviews />
                        </TabPanel>
                        <TabPanel>
                            <AdminUsers />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Flex>
    );
};

export default Admin;