import {useAuth} from "../context/AuthContext.jsx";
import React, {useEffect} from "react";

const {handleOAuthCallback} = useAuth()

const OAuthCallbackPage = () => {
    useEffect(() => {
        const provider = window.location.pathname.split('/')[2];
        handleOAuthCallback(provider);
    }, []);

    return <div>Processing OAuth callback...</div>;
};

export default OAuthCallbackPage;