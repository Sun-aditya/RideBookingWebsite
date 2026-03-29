import { useCallback, useState } from "react";

export default function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const geoError = new Error("Geolocation is not supported in this browser.");
        setError(geoError.message);
        setLoading(false);
        reject(geoError);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          setError(null);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          setError(err.message || "Unable to fetch current location");
          setLoading(false);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const watchLocation = useCallback((callback) => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(coords);
        setError(null);
        callback?.(coords);
      },
      (err) => {
        setError(err.message || "Location watch failed");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return watchId;
  }, []);

  const stopWatching = useCallback((watchId) => {
    if (watchId !== null && watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return { location, error, loading, getCurrentLocation, watchLocation, stopWatching };
}
