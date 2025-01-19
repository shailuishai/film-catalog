import React, { createContext, useContext, useEffect, useState } from "react";
import { logout, OAuthCallback, signIn, signUp } from "../services/userServices/authServices";
import { getProfile } from "../services/userServices/profileSevices";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children, navigate }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const token = Cookies.get("access_token");
                if (token) {
                    const profile = await getProfile();
                    setUser(profile.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
                console.error("Auth check error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleSignIn = async (credentials) => {
        setIsLoading(true);
        try {
            const response = await signIn(credentials);
            const { access_token } = response.data;
            if (access_token) {
                Cookies.set("access_token", access_token, { expires: 480 / (60 * 60 * 24), sameSite: "none", secure: true });
                const profile = await getProfile();
                setUser(profile.data);
                navigate("/profile");
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (userData) => {
        setIsLoading(true);
        try {
            await signUp(userData);
            navigate("/confirm-email", { state: { email: userData.email } });
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            Cookies.remove("access_token");
            await logout();
            navigate("/auth");
            setUser(null);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = (provider) => {
        window.location.href = `https://film-catalog-8re5.onrender.com/v1/auth/${provider}`;
    };

    const handleOAuthCallback = async (provider) => {
        const urlParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlParams.entries());

        try {
            const response = await OAuthCallback(provider, params);
            const { access_token } = response.data;
            if (access_token) {
                Cookies.set("access_token", access_token, { expires: 480 / (60 * 60 * 24), sameSite: "none", secure: true });
                const profile = await getProfile();
                setUser(profile.data); // Обновляем состояние пользователя
                navigate("/profile"); // Перенаправляем на страницу профиля
            }
        } catch (error) {
            setUser(null);
            console.error("OAuth callback error:", error);
            navigate("/auth");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                signIn: handleSignIn,
                signUp: handleSignUp,
                logout: handleLogout,
                handleOAuth,
                handleOAuthCallback,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);