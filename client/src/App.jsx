import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider, Box, Flex } from "@chakra-ui/react";
import theme from "./theme";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Callback from "./pages/Callback";
import { useState } from "react"; // Добавляем useState

const App = () => {
    const [isCollapsed, setIsCollapsed] = useState(false); // Состояние для сворачивания сайдбара

    return (
        <ChakraProvider theme={theme}>
            <Router>
                <Flex>
                    <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    <Box
                        flex={1}
                        ml={{ base: 0, md: isCollapsed ? "116px" : "366px" }} // Динамический отступ
                        transition="margin-left 0.3s" // Плавный переход
                        px={{ base: 0, md: isCollapsed ? "100px" : "175px" }}
                    >
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/auth/callback/:provider" element={<Callback />} />
                            {/*<Route path="/films" element={<Films />} />*/}
                            {/*<Route path="/films/:id" element={<FilmDetail />} />*/}
                            {/*<Route path="*" element={<NotFound />} />*/}
                        </Routes>
                    </Box>
                </Flex>
            </Router>
        </ChakraProvider>
    );
};

export default App;