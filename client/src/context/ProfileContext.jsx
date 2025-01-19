// ProfileContext.jsx
import React, { createContext, useContext, useState } from "react";
import { getProfile, updateProfile, deleteProfile } from "../services/userServices/profileSevices.js";
import Cookies from "js-cookie";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("access_token");
            if (token) {
                const profile = await getProfile();
                setUser(profile.data);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (data, avatarFile, resetAvatar) => {
        setIsLoading(true);
        try {
            const updatedUser = await updateProfile(data, avatarFile, resetAvatar);
            setUser(updatedUser.data);
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
        } catch (error) {
            console.error("Failed to delete profile:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProfileContext.Provider
            value={{
                user,
                isLoading,
                fetchProfile,
                updateProfile: handleUpdateProfile,
                deleteProfile: handleDeleteProfile,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => useContext(ProfileContext);