import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  bookRide,
  cancelRide,
  getActiveRide,
  getFareEstimate,
  getNearbyDrivers,
  getRideById,
  getRideHistory,
  rateRide,
} from "../api/rideApi";
import { emitEvent } from "../socket/socketClient";
import useSocket from "../hooks/useSocket";

const RideContext = createContext(null);

export function RideProvider({ children }) {
  const [currentRide, setCurrentRide] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fareEstimates, setFareEstimates] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [rideStatus, setRideStatus] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);

  const { subscribeToRideEvents } = useSocket();

  const fetchFareEstimate = useCallback(async (pickup, drop) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFareEstimate({
        pickupLat: pickup?.coordinates?.lat,
        pickupLng: pickup?.coordinates?.lng,
        dropLat: drop?.coordinates?.lat,
        dropLng: drop?.coordinates?.lng,
      });
      console.log("Fare estimate response", response);
      setFareEstimates(response?.estimates || null);
      return response;
    } catch (apiError) {
      console.log("fetchFareEstimate error", apiError);
      setError(apiError?.message || "Unable to fetch fare estimates");
      toast.error(apiError?.message || "Unable to connect to server");
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNearbyDrivers = useCallback(async (latitude, longitude, vehicleType) => {
    try {
      const response = await getNearbyDrivers({ latitude, longitude, vehicleType });
      console.log("Nearby drivers response", response);
      setNearbyDrivers(response?.drivers || []);
      return response?.drivers || [];
    } catch (apiError) {
      console.log("fetchNearbyDrivers error", apiError);
      toast.error(apiError?.message || "Unable to connect to server");
      return [];
    }
  }, []);

  const bookRideRequest = useCallback(async (rideData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookRide(rideData);
      console.log("Book ride response", response);
      const ride = response?.ride;

      setCurrentRide(ride);
      setRideStatus(ride?.status || "requested");
      setBookingStep(3);

      emitEvent("ride:request", { rideId: ride?._id });
      toast.success("Ride booked! Looking for a driver...");
      return { success: true, ride };
    } catch (apiError) {
      console.log("bookRideRequest error", apiError);
      setError(apiError?.message || "Ride booking failed");
      toast.error(apiError?.message || "Unable to connect to server");
      return { success: false, error: apiError };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelCurrentRide = useCallback(async (reason) => {
    if (!currentRide?._id) return;
    try {
      const response = await cancelRide(currentRide._id, { reason });
      console.log("Cancel ride response", response);
      setCurrentRide(null);
      setRideStatus("cancelled");
      toast.success("Ride cancelled");
    } catch (apiError) {
      console.log("cancelCurrentRide error", apiError);
      toast.error(apiError?.message || "Unable to connect to server");
    }
  }, [currentRide]);

  const fetchActiveRide = useCallback(async () => {
    try {
      const response = await getActiveRide();
      console.log("Active ride response", response);
      const activeRide = response?.activeRide || null;
      setCurrentRide(activeRide);
      setRideStatus(activeRide?.status || null);
      return activeRide;
    } catch (apiError) {
      console.log("fetchActiveRide error", apiError);
      return null;
    }
  }, []);

  const fetchRideById = useCallback(async (rideId) => {
    try {
      const response = await getRideById(rideId);
      console.log("Ride by id response", response);
      const ride = response?.ride || null;
      if (ride) {
        setCurrentRide(ride);
        setRideStatus(ride?.status || null);
      }
      return ride;
    } catch (apiError) {
      console.log("fetchRideById error", apiError);
      toast.error(apiError?.message || "Unable to connect to server");
      return null;
    }
  }, []);

  const fetchRideHistory = useCallback(async (params = {}) => {
    try {
      const response = await getRideHistory(params);
      console.log("Ride history response", response);
      return response;
    } catch (apiError) {
      console.log("fetchRideHistory error", apiError);
      toast.error(apiError?.message || "Unable to connect to server");
      return { rides: [], count: 0, total: 0, page: 1, pages: 1 };
    }
  }, []);

  const submitRating = useCallback(async (rideId, rating, comment) => {
    try {
      const response = await rateRide(rideId, { rating, comment });
      console.log("Rate ride response", response);
      toast.success("Rating submitted!");
      return response;
    } catch (apiError) {
      console.log("submitRating error", apiError);
      toast.error(apiError?.message || "Unable to connect to server");
      throw apiError;
    }
  }, []);

  const resetBooking = useCallback(() => {
    setBookingStep(1);
    setSelectedVehicle(null);
    setFareEstimates(null);
    setPickupLocation(null);
    setDropLocation(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!currentRide?._id) return undefined;

    const cleanup = subscribeToRideEvents(currentRide._id, {
      onStatusUpdate: (data) => {
        console.log("Socket ride:status_update", data);
        if (data?.status) setRideStatus(data.status);
        if (data?.message) toast.success(data.message);
      },
      onDriverAssigned: (data) => {
        console.log("Socket ride:driver_assigned", data);
        setCurrentRide((prev) => ({ ...(prev || {}), driver: data?.driver }));
        toast.success("Driver assigned!");
      },
      onLocationUpdate: (data) => {
        setDriverLocation({ latitude: data?.latitude, longitude: data?.longitude });
      },
      onCancelled: () => {
        setRideStatus("cancelled");
        setCurrentRide(null);
        toast.error("Ride was cancelled");
      },
      onCompleted: () => {
        setRideStatus("completed");
        toast.success("Ride completed!");
      },
    });

    return cleanup;
  }, [currentRide?._id, subscribeToRideEvents]);

  const value = useMemo(
    () => ({
      currentRide,
      bookingStep,
      selectedVehicle,
      fareEstimates,
      nearbyDrivers,
      rideStatus,
      driverLocation,
      chatMessages,
      loading,
      error,
      pickupLocation,
      dropLocation,
      fetchFareEstimate,
      fetchNearbyDrivers,
      bookRideRequest,
      cancelCurrentRide,
      fetchActiveRide,
      fetchRideHistory,
      fetchRideById,
      submitRating,
      setBookingStep,
      setSelectedVehicle,
      setPickupLocation,
      setDropLocation,
      setChatMessages,
      resetBooking,
    }),
    [
      currentRide,
      bookingStep,
      selectedVehicle,
      fareEstimates,
      nearbyDrivers,
      rideStatus,
      driverLocation,
      chatMessages,
      loading,
      error,
      pickupLocation,
      dropLocation,
      fetchFareEstimate,
      fetchNearbyDrivers,
      bookRideRequest,
      cancelCurrentRide,
      fetchActiveRide,
      fetchRideHistory,
      fetchRideById,
      submitRating,
      resetBooking,
    ]
  );

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
}

export const useRideContext = () => {
  const context = useContext(RideContext);
  if (!context) throw new Error("useRideContext must be used within RideProvider");
  return context;
};

export { RideContext };

