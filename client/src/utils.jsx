// utils.js
export const getPosterUrl = (posterUrl, posterPrefix) => {
    if (!posterUrl) return null;

    const isDefaultPoster = posterUrl.includes("default");

    if (isDefaultPoster) {
        const parts = posterUrl.split('.');
        const extension = parts.pop();
        const baseUrl = parts.join('.');
        return `${baseUrl}${posterPrefix}.${extension}`;
    }

    return posterUrl;
};

export const getRatingColorScheme = (rating) => {
    if (rating >= 80) return "green"; // Высокий рейтинг
    if (rating >= 50) return "yellow"; // Средний рейтинг
    return "red"; // Низкий рейтинг
};

export const formatReleaseDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

export const getAvatarUrl = (avatarUrl, avatarPrefix) => {
    if (!avatarUrl) return null;

    const isDefaultAvatar = avatarUrl.includes("default");

    if (isDefaultAvatar) {
        return `${avatarUrl}64x64${avatarPrefix}.webp`;
    }

    return `${avatarUrl}64x64.webp`;
};