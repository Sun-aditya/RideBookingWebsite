import axiosInstance from "./axiosInstance";

export const getNearbyDrivers = (params) => axiosInstance.get("/rides/nearby-drivers", { params });
export const getFareEstimate = (params) => axiosInstance.get("/rides/fare-estimate", { params });
export const bookRide = (data) => axiosInstance.post("/rides/book", data);
export const getActiveRide = () => axiosInstance.get("/rides/active");
export const getRideById = (id) => axiosInstance.get(`/rides/${id}`);
export const cancelRide = (id, data) => axiosInstance.patch(`/rides/${id}/cancel`, data);
export const getRideHistory = (params) => axiosInstance.get("/rides/history", { params });
export const rateRide = (id, data) => axiosInstance.post(`/rides/${id}/rate`, data);
