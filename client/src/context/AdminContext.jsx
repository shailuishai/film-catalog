import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
    createFilm,
    updateFilm,
    deleteFilm,
    adminGetAllFilms,
    adminMultiDeleteFilms,
    createActor,
    updateActor,
    deleteActor,
    adminGetAllActors,
    adminMultiDeleteActors,
    adminGetAllUsers,
    adminDeleteUser,
    adminMultiDeleteUsers,
    adminCreateReview,
    adminUpdateReview,
    adminDeleteReview,
    adminGetAllReviews,
    createGenre,
    updateGenre,
    deleteGenre,
    getGenres,
} from "../services/adminServices";
import {useAuth} from "./AuthContext.jsx";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const { user } = useAuth();
    const [films, setFilms] = useState([]);
    const [actors, setActors] = useState([]);
    const [genres, setGenres] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Films
    const fetchFilms = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminGetAllFilms();
            setFilms(data);
        } catch (error) {
            console.error("Failed to fetch films:", error);
            setFilms([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCreateFilm = async (filmData, poster) => {
        try {
            await createFilm(filmData, poster);
            await fetchFilms();
        } catch (error) {
            console.error("Failed to create film:", error);
        }
    };

    const handleUpdateFilm = async (id, filmData) => {
        try {
            await updateFilm(id, filmData);
            await fetchFilms();
        } catch (error) {
            console.error("Failed to update film:", error);
        }
    };

    const handleDeleteFilm = async (id) => {
        try {
            await deleteFilm(id);
            await fetchFilms();
        } catch (error) {
            console.error("Failed to delete film:", error);
        }
    };

    const handleMultiDeleteFilms = async (filmIds) => {
        try {
            await adminMultiDeleteFilms(filmIds);
            await fetchFilms();
        } catch (error) {
            console.error("Failed to delete films:", error);
        }
    };

    // Actors
    const fetchActors = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminGetAllActors();
            setActors(data);
        } catch (error) {
            console.error("Failed to fetch actors:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCreateActor = async (actorData) => {
        try {
            await createActor(actorData);
            await fetchActors();
        } catch (error) {
            console.error("Failed to create actor:", error);
        }
    };

    const handleUpdateActor = async (id, actorData) => {
        try {
            await updateActor(id, actorData);
            await fetchActors();
        } catch (error) {
            console.error("Failed to update actor:", error);
        }
    };

    const handleDeleteActor = async (id) => {
        try {
            await deleteActor(id);
            await fetchActors();
        } catch (error) {
            console.error("Failed to delete actor:", error);
        }
    };

    const handleMultiDeleteActors = async (actorIds) => {
        try {
            await adminMultiDeleteActors(actorIds);
            await fetchActors();
        } catch (error) {
            console.error("Failed to delete actors:", error);
        }
    };

    // Users
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminGetAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDeleteUser = async (id) => {
        try {
            await adminDeleteUser(id);
            await fetchUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    const handleMultiDeleteUsers = async (userIds) => {
        try {
            await adminMultiDeleteUsers(userIds);
            await fetchUsers();
        } catch (error) {
            console.error("Failed to delete users:", error);
        }
    };

    // Reviews
    const fetchReviews = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminGetAllReviews();
            setReviews(data);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCreateReview = async (reviewData) => {
        try {
            await adminCreateReview(reviewData);
            await fetchReviews();
        } catch (error) {
            console.error("Failed to create review:", error);
        }
    };

    const handleUpdateReview = async (reviewData) => {
        try {
            await adminUpdateReview(reviewData);
            await fetchReviews();
        } catch (error) {
            console.error("Failed to update review:", error);
        }
    };

    const handleDeleteReview = async (id) => {
        try {
            await adminDeleteReview(id);
            await fetchReviews();
        } catch (error) {
            console.error("Failed to delete review:", error);
        }
    };

    // Genres
    const fetchGenres = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getGenres();
            setGenres(data);
        } catch (error) {
            console.error("Failed to fetch genres:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCreateGenre = async (genreData) => {
        try {
            await createGenre(genreData);
            await fetchGenres();
        } catch (error) {
            console.error("Failed to create genre:", error);
        }
    };

    const handleUpdateGenre = async (genreData) => {
        try {
            await updateGenre(genreData);
            await fetchGenres();
        } catch (error) {
            console.error("Failed to update genre:", error);
        }
    };

    const handleDeleteGenre = async (id) => {
        try {
            await deleteGenre(id);
            await fetchGenres();
        } catch (error) {
            console.error("Failed to delete genre:", error);
        }
    };

    const fetchDataIfAdmin = async () => {
        if (user?.is_admin) {
            await fetchFilms();
            await fetchActors();
            await fetchGenres();
            await fetchReviews();
            await fetchUsers();
        }
    };

    return (
        <AdminContext.Provider
            value={{
                films,
                actors,
                genres,
                reviews,
                users,
                isLoading,
                fetchFilms,
                handleCreateFilm,
                handleUpdateFilm,
                handleDeleteFilm,
                handleMultiDeleteFilms,
                fetchActors,
                handleCreateActor,
                handleUpdateActor,
                handleDeleteActor,
                handleMultiDeleteActors,
                fetchUsers,
                handleDeleteUser,
                handleMultiDeleteUsers,
                fetchReviews,
                handleCreateReview,
                handleUpdateReview,
                handleDeleteReview,
                fetchGenres,
                handleCreateGenre,
                handleUpdateGenre,
                handleDeleteGenre,
                fetchDataIfAdmin,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);