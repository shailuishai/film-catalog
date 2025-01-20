import React, { createContext, useContext, useEffect, useState } from "react";
import { logout, OAuthCallback, signIn, signUp } from "../services/userServices/authServices";
import { getProfile, updateProfile, deleteProfile } from "../services/userServices/profileSevices";
import { getReviewsByFilmId, getReviewsByReviewerId, createReview, updateReview, deleteReview } from "../services/userServices/reviewServices";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children, navigate }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]); // Состояние для отзывов

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("access_token");
            if (token) {
                const profile = await getProfile();
                setUser(profile.data);
                await fetchReviews();
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

    const fetchReviews = async () => {
        try {
            const response = await getReviewsByReviewerId();
            if (response.status === "success") {
                setReviews(response.data);
            }
        } catch (error) {
            console.error("Ошибка при загрузке отзывов:", error);
        }
    };

    const fetchReviewsByFilmId = async (filmId) => {
        try {
            const response = await getReviewsByFilmId(filmId);
            if (response.status === "success") {
                return response.data;
            }
        } catch (error) {
            console.error("Ошибка при загрузке отзывов:", error);
        }
        return [];
    };

    const handleCreateReview = async (filmId, rating, reviewText) => {
        try {
            const reviewData = {
                user_id: user.user_id,
                film_id: filmId,
                rating: rating,
                review_text: reviewText,
            };
            const response = await createReview(reviewData);
            if (response.status === "success") {
                await fetchReviewsByFilmId(filmId); // Обновляем отзывы после создания
                return response.data;
            }
        } catch (error) {
            console.error("Ошибка при создании отзыва:", error);
        }
    };

    const handleUpdateReview = async (reviewId, rating, reviewText) => {
        try {
            const reviewData = {
                review_id: reviewId,
                user_id: user.user_id,
                rating: rating,
                review_text: reviewText,
            };
            const response = await updateReview(reviewId, reviewData);
            if (response.status === "success") {
                await fetchReviews(); // Обновляем отзывы после обновления
                return response.data;
            }
        } catch (error) {
            console.error("Ошибка при обновлении отзыва:", error);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            const response = await deleteReview(reviewId);
            if (response.status === "success") {
                await fetchReviews(); // Обновляем отзывы после удаления
            }
        } catch (error) {
            console.error("Ошибка при удалении отзыва:", error);
        }
    };

    useEffect(() => {
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
                await fetchReviews(profile.data.user_id); // Загружаем отзывы после успешного входа
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
            setReviews([]); // Очищаем отзывы при выходе
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
                setUser(profile.data);
                await fetchReviews(profile.data.user_id); // Загружаем отзывы после успешной OAuth авторизации
                navigate("/profile");
            }
        } catch (error) {
            setUser(null);
            console.error("OAuth callback error:", error);
            navigate("/auth");
        }
    };

    const handleUpdateProfile = async (data, avatarFile, resetAvatar) => {
        setIsLoading(true);
        try {
            await updateProfile(data, avatarFile, resetAvatar);
            const profile = await getProfile();
            setUser(profile.data);
        } catch (error) {
            console.error("Failed to update profile:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProfile = async () => {
        setIsLoading(true);
        try {
            await deleteProfile();
            setUser(null);
            setReviews([]); // Очищаем отзывы при удалении профиля
        } catch (error) {
            console.error("Failed to delete profile:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                reviews,
                checkAuth,
                signIn: handleSignIn,
                signUp: handleSignUp,
                logout: handleLogout,
                handleOAuth,
                handleOAuthCallback,
                updateProfile: handleUpdateProfile,
                deleteProfile: handleDeleteProfile,
                fetchReviews,
                fetchReviewsByFilmId,
                createReview: handleCreateReview,
                updateReview: handleUpdateReview,
                deleteReview: handleDeleteReview,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);