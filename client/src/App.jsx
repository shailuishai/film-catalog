import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChakraProvider, Box, Flex } from "@chakra-ui/react";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ConfirmEmail from "./pages/ConfirmEmail";
import Profile from "./pages/Profile.jsx";
import OAuthCallbackPage from "./pages/OAuthCallbackPage.jsx";
import Films from "./pages/Films";
import FilmDetail from "./pages/FilmDetail";
import Actors from "./pages/Actors.jsx"; // Импортируем компонент FilmDetail

const App = () => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem("sidebarCollapsed");
        return savedState ? JSON.parse(savedState) : false;
    });

    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    return (
        <ChakraProvider theme={theme}>
            <AuthProvider navigate={navigate}>
                <Flex>
                    <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    <Box
                        flex={1}
                        ml={{ base: 0, md: isCollapsed ? "116px" : "366px" }}
                        px={{ base: 0, md: isCollapsed ? "100px" : "175px" }}
                        transition="margin-left 0.3s"
                    >
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/confirm-email" element={<ConfirmEmail />} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/auth/:provider/callback" element={<OAuthCallbackPage />} />
                            <Route path="/films" element={<Films />} />
                            <Route path="/films/:id" element={<FilmDetail />} /> {/* Добавляем маршрут для деталей фильма */}
                            <Route path="/actors" element={<Actors />} />
                        </Routes>
                    </Box>
                </Flex>
            </AuthProvider>
        </ChakraProvider>
    );
};

export default App;