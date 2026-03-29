import axiosInstance from "./axiosInstance";

export const getDriverActiveRide = () => axiosInstance.get("/driver/rides/active");
export const acceptRide = (id) => axiosInstance.patch(`/driver/rides/${id}/accept`);
export const updateRideStatus = (id, data) => axiosInstance.patch(`/driver/rides/${id}/status`, data);
export const verifyOTP = (id, data) => axiosInstance.post(`/driver/rides/${id}/verify-otp`, data);
export const getDriverRideHistory = (params) => axiosInstance.get("/driver/rides/history", { params });
export const getDriverEarnings = (params) => axiosInstance.get("/driver/rides/earnings", { params });
