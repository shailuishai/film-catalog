import React, { createContext, useContext, useState, useEffect } from "react";
import {
    getAdminFilms,
    getAdminActors,
    getAdminGenres,
    getAdminReviews,
    getAdminUsers,
    deleteAdminFilm,
    deleteAdminActor,
    deleteAdminGenre,
    deleteAdminReview,
    deleteAdminUser,
} from "../services/adminServices";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [films, setFilms] = useState([]);
    const [actors, setActors] = useState([]);
    const [genres, setGenres] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загрузка данных
    const fetchFilms = async () => {
        setLoading(true);
        try {
            const data = await getAdminFilms();
            setFilms(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActors = async () => {
        setLoading(true);
        try {
            const data = await getAdminActors();
            setActors(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGenres = async () => {
        setLoading(true);
        try {
            const data = await getAdminGenres();
            setGenres(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await getAdminReviews();
            setReviews(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAdminUsers();
            setUsers(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    // Удаление данных
    const deleteFilm = async (filmId) => {
        try {
            await deleteAdminFilm(filmId);
            setFilms((prev) => prev.filter((film) => film.id !== filmId));
        } catch (error) {
            setError(error);
        }
    };

    const deleteActor = async (actorId) => {
        try {
            await deleteAdminActor(actorId);
            setActors((prev) => prev.filter((actor) => actor.id !== actorId));
        } catch (error) {
            setError(error);
        }
    };

    const deleteGenre = async (genreId) => {
        try {
            await deleteAdminGenre(genreId);
            setGenres((prev) => prev.filter((genre) => genre.id !== genreId));
        } catch (error) {
            setError(error);
        }
    };

    const deleteReview = async (reviewId) => {
        try {
            await deleteAdminReview(reviewId);
            setReviews((prev) => prev.filter((review) => review.id !== reviewId));
        } catch (error) {
            setError(error);
        }
    };

    const deleteUser = async (userId) => {
        try {
            await deleteAdminUser(userId);
            setUsers((prev) => prev.filter((user) => user.id !== userId));
        } catch (error) {
            setError(error);
        }
    };

    // Обновление данных при монтировании
    useEffect(() => {
        fetchFilms();
        fetchActors();
        fetchGenres();
        fetchReviews();
        fetchUsers();
    }, []);

    return (
        <AdminContext.Provider
            value={{
                films,
                actors,
                genres,
                reviews,
                users,
                loading,
                error,
                deleteFilm,
                deleteActor,
                deleteGenre,
                deleteReview,
                deleteUser,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);