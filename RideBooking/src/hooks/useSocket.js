import { useCallback } from "react";
import { emitEvent, offEvent, onEvent } from "../socket/socketClient";

export default function useSocket() {
  const subscribeToRideEvents = useCallback((rideId, callbacks = {}) => {
    emitEvent("ride:request", { rideId });

    if (callbacks.onStatusUpdate) onEvent("ride:status_update", callbacks.onStatusUpdate);
    if (callbacks.onDriverAssigned) onEvent("ride:driver_assigned", callbacks.onDriverAssigned);
    if (callbacks.onLocationUpdate) onEvent("location:driver_moved", callbacks.onLocationUpdate);
    if (callbacks.onCancelled) onEvent("ride:cancelled", callbacks.onCancelled);
    if (callbacks.onCompleted) onEvent("ride:completed", callbacks.onCompleted);

    return () => {
      if (callbacks.onStatusUpdate) offEvent("ride:status_update", callbacks.onStatusUpdate);
      if (callbacks.onDriverAssigned) offEvent("ride:driver_assigned", callbacks.onDriverAssigned);
      if (callbacks.onLocationUpdate) offEvent("location:driver_moved", callbacks.onLocationUpdate);
      if (callbacks.onCancelled) offEvent("ride:cancelled", callbacks.onCancelled);
      if (callbacks.onCompleted) offEvent("ride:completed", callbacks.onCompleted);
    };
  }, []);

  const unsubscribeFromRideEvents = useCallback(() => {
    offEvent("ride:status_update");
    offEvent("ride:driver_assigned");
    offEvent("location:driver_moved");
    offEvent("ride:cancelled");
    offEvent("ride:completed");
  }, []);

  const sendMessage = useCallback((rideId, message, receiverId) => {
    emitEvent("chat:send_message", { rideId, message, receiverId });
  }, []);

  const subscribeToMessages = useCallback((callback) => {
    onEvent("chat:new_message", callback);
    return () => offEvent("chat:new_message", callback);
  }, []);

  const updateDriverLocation = useCallback((latitude, longitude, rideId) => {
    emitEvent("location:driver_update", { latitude, longitude, rideId });
  }, []);

  return {
    subscribeToRideEvents,
    unsubscribeFromRideEvents,
    sendMessage,
    subscribeToMessages,
    updateDriverLocation,
  };
}
