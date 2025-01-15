import {useAuth} from "../context/AuthContext.jsx";
import React, {useEffect, useState} from "react";
import {Flex, Spinner} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";



const OAuthCallbackPage = () => {
    const { handleOAuthCallback } = useAuth();
    const navigate = useNavigate();
    const [isCallbackHandled, setIsCallbackHandled] = useState(false);

    useEffect(() => {
        const provider = window.location.pathname.split('/')[2];
        if (!provider || isCallbackHandled) {
            console.error("Provider not found in URL or callback already handled");
            return;
        }

        const handleCallback = async () => {
            try {
                await handleOAuthCallback(provider);
                setIsCallbackHandled(true);
                navigate("/profile");
            } catch (error) {
                console.error("OAuth callback error:", error);
                navigate("/auth");
            }
        };

        handleCallback();
    }, [isCallbackHandled]);

    return (
        <Flex w="100%" h="100vh" alignItems="center" justifyContent="center">
            <Spinner size="xl" aria-label="Loading" />
        </Flex>
    );
};

export default OAuthCallbackPage;