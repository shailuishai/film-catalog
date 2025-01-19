import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
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
import {ProfileProvider} from "./context/ProfileContext.jsx";

const App = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate(); // Получаем navigate

    return (
        <ChakraProvider theme={theme}>
            <AuthProvider navigate={navigate}> {/* Передаем navigate в AuthProvider */}
                <ProfileProvider>
                    <Flex>
                        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                        <Box
                            flex={1}
                            ml={{ base: 0, md: isCollapsed ? "116px" : "366px" }}
                            transition="margin-left 0.3s"
                            px={{ base: 0, md: isCollapsed ? "100px" : "175px" }}
                        >
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/confirm-email" element={<ConfirmEmail />} />
                                <Route path="/profile" element={ <ProtectedRoute> <Profile /> </ProtectedRoute> } />
                                <Route path="/auth/:provider/callback" element={<OAuthCallbackPage />} />
                            </Routes>
                        </Box>
                    </Flex>
                </ProfileProvider>
            </AuthProvider>
        </ChakraProvider>
    );
};

export default App;