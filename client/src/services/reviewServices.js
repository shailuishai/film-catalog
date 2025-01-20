import api from "./api";

export const getReviewsByFilmId = async (filmId) => {
    const response = await api.get(`/reviews/film/${filmId}`);
    return response.data;
};

export const getReviewsByReviewerId = async (reviewerId) => {
    const response = await api.get(`/reviews/reviewer/${reviewerId}`);
    return response.data;
};

export const createReview = async (reviewData) => {
    const response = await api.post("/reviews", reviewData);
    return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
};