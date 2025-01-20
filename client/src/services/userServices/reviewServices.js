import api from "../api.js";
import Cookies from "js-cookie";

export const getReviewsByFilmId = async (filmId) => {
    const response = await api.get(`/reviews/film/${filmId}`);
    return response.data;
};

export const getReviewsById = async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
}

export const getReviewsByReviewerId = async () => {
    const token = Cookies.get("access_token");

    const response = await api.get(`/reviews/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export const createReview = async (reviewData) => {
    const token = Cookies.get("access_token");

    const response = await api.post("/reviews", reviewData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
    const token = Cookies.get("access_token");

    const response = await api.put(`/reviews/${reviewId}`, reviewData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export const deleteReview = async (reviewId) => {
    const token = Cookies.get("access_token");

    const response = await api.delete(`/reviews/${reviewId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};