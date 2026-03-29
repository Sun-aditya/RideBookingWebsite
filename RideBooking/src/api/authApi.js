import axiosInstance from "./axiosInstance";

export const registerRider = (data) => axiosInstance.post("/auth/user/register", data);
export const loginRider = (data) => axiosInstance.post("/auth/user/login", data);
export const getMyProfile = () => axiosInstance.get("/auth/user/me");
export const updateProfile = (data) => axiosInstance.put("/auth/user/update-profile", data);
export const changePassword = (data) => axiosInstance.put("/auth/user/change-password", data);
export const logoutUser = () => axiosInstance.post("/auth/user/logout");

export const registerDriver = (data) => axiosInstance.post("/auth/driver/register", data);
export const loginDriver = (data) => axiosInstance.post("/auth/driver/login", data);
export const getDriverProfile = () => axiosInstance.get("/auth/driver/me");
export const updateDriverLocation = (data) => axiosInstance.put("/auth/driver/update-location", data);
export const toggleDriverStatus = (data) => axiosInstance.put("/auth/driver/toggle-status", data);
