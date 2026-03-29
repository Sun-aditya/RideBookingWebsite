import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Clock3, MapPin, Star } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import RideOptions from "../components/ride/RideOptions";
import { RIDE_TYPES } from "../utils/constants";
import { getDriverActiveRide, getDriverEarnings, acceptRide } from "../api/driverApi";
import { toggleDriverStatus } from "../api/authApi";
import { onEvent, offEvent } from "../socket/socketClient";
import useSocket from "../hooks/useSocket";
import useLocation from "../hooks/useLocation";

export default function DriverDashboard() {
  const [online, setOnline] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    totalRides: 0,
    averageFare: 0,
    rides: [],
  });
  const watchIdRef = useRef(null);

  const { updateDriverLocation } = useSocket();
  const { watchLocation, stopWatching } = useLocation();

  useEffect(() => {
    const initialize = async () => {
      try {
        const [activeResponse, earningsResponse] = await Promise.all([
          getDriverActiveRide(),
          getDriverEarnings({ period: "today" }),
        ]);

        console.log("Driver active ride response", activeResponse);
        console.log("Driver earnings response", earningsResponse);

        setActiveRide(activeResponse?.activeRide || null);
        setEarningsData({
          totalEarnings: earningsResponse?.totalEarnings || 0,
          totalRides: earningsResponse?.totalRides || 0,
          averageFare: earningsResponse?.averageFare || 0,
          rides: earningsResponse?.rides || [],
        });
      } catch (error) {
        console.log("Driver dashboard initialization error", error);
        toast.error(error?.message || "Unable to connect to server");
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const onRideRequest = (data) => {
      console.log("Incoming ride request", data);
      setIncomingRequest(data);
      setCountdown(10);
    };

    onEvent("ride:new_request", onRideRequest);
    return () => offEvent("ride:new_request", onRideRequest);
  }, []);

  useEffect(() => {
    if (!incomingRequest || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [incomingRequest, countdown]);

  useEffect(() => {
    if (countdown === 0 && incomingRequest) {
      console.log("Ride request expired");
      toast("Ride request timed out");
      setIncomingRequest(null);
    }
  }, [countdown, incomingRequest]);

  useEffect(() => {
    if (!online) {
      if (watchIdRef.current !== null) {
        stopWatching(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    watchIdRef.current = watchLocation((coords) => {
      updateDriverLocation(coords.latitude, coords.longitude, activeRide?._id);
    });

    return () => {
      if (watchIdRef.current !== null) {
        stopWatching(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [online, watchLocation, stopWatching, updateDriverLocation, activeRide?._id]);

  const chartBars = useMemo(() => [35, 70, 55, 90, 45, 75, 60], []);

  const stats = useMemo(
    () => [
      { label: "Today's Earnings", value: `₹${Number(earningsData.totalEarnings || 0).toFixed(0)}` },
      { label: "Rides Completed", value: String(earningsData.totalRides || 0) },
      { label: "Average Fare", value: `₹${Number(earningsData.averageFare || 0).toFixed(0)}` },
      { label: "Rating", value: "4.9" },
    ],
    [earningsData]
  );

  const toggleStatus = async () => {
    try {
      const nextOnline = !online;
      const response = await toggleDriverStatus({ isOnline: nextOnline });
      console.log("Toggle driver status response", response);
      setOnline(nextOnline);
      toast.success(`Driver is now ${nextOnline ? "online" : "offline"}`);
    } catch (error) {
      console.log("Toggle driver status error", error);
      toast.error(error?.message || "Unable to connect to server");
    }
  };

  const onAccept = async () => {
    if (!incomingRequest?.rideId) return;
    try {
      const response = await acceptRide(incomingRequest.rideId);
      console.log("Accept ride response", response);
      setActiveRide(response?.ride || null);
      setIncomingRequest(null);
      toast.success("Ride accepted");
    } catch (error) {
      console.log("Accept ride error", error);
      toast.error(error?.message || "Unable to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-2xl border border-brand-mediumGray bg-brand-darkGray p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Driver Dashboard</h1>
              <p className="text-sm text-gray-400">Manage requests and earnings in real-time.</p>
            </div>

            <button
              onClick={toggleStatus}
              className={`relative h-12 w-28 rounded-full p-1 transition ${online ? "bg-brand-green" : "bg-brand-mediumGray"}`}
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-full bg-white text-xs font-bold text-black transition ${
                  online ? "translate-x-16" : "translate-x-0"
                }`}
              >
                {online ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.label} className="text-center">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-brand-green">{item.value}</p>
            </Card>
          ))}
        </div>

        {online && incomingRequest ? (
          <Card className="space-y-3 border-brand-green/40">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-green">Current Ride Request</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/20 px-3 py-1 text-sm text-brand-green">
                <Clock3 className="h-4 w-4" /> {countdown}s
              </span>
            </div>

            <div className="text-sm text-gray-300">
              <p>
                Rider: <span className="font-semibold text-white">{incomingRequest?.rider?.name || "--"}</span>
              </p>
              <p className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {incomingRequest?.pickup?.address || "--"}
              </p>
              <p>Distance: {incomingRequest?.distance || "--"} km</p>
              <p>
                Estimated fare: <span className="font-semibold text-brand-green">₹{incomingRequest?.fare || 0}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-brand-green text-black hover:bg-emerald-400" onClick={onAccept}>
                Accept
              </Button>
              <Button
                className="flex-1"
                variant="danger"
                onClick={() => {
                  console.log("Driver declined request");
                  toast.error("Ride declined");
                  setIncomingRequest(null);
                }}
              >
                Decline
              </Button>
            </div>
          </Card>
        ) : null}

        {activeRide ? (
          <Card>
            <h3 className="mb-3 text-lg font-bold">Active Ride</h3>
            <div className="text-sm text-gray-300">
              <p>Pickup: {activeRide?.pickupLocation?.address || "--"}</p>
              <p>Drop: {activeRide?.dropLocation?.address || "--"}</p>
              <p>Status: {activeRide?.status || "--"}</p>
            </div>
          </Card>
        ) : null}

        <Card>
          <h3 className="mb-4 text-lg font-bold">Earnings (Weekly)</h3>
          <div className="flex h-36 items-end gap-2 rounded-xl bg-black/40 p-4">
            {chartBars.map((bar, index) => (
              <div key={index} className="flex-1 rounded-t bg-brand-green/70" style={{ height: `${bar}%` }} />
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-bold">Recent Rides</h3>
          <div className="space-y-2">
            {(earningsData.rides || []).slice(0, 5).map((ride) => (
              <div
                key={ride._id}
                className="flex items-center justify-between rounded-xl border border-brand-mediumGray bg-black/40 p-3"
              >
                <div>
                  <p className="font-medium">{ride?.rider?.fullName || "Rider"}</p>
                  <p className="text-xs text-gray-400">
                    {ride?.pickupLocation?.address || "--"} to {ride?.dropLocation?.address || "--"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-green">₹{ride?.fare?.totalFare || 0}</p>
                  <p className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Star className="h-3 w-3 text-brand-yellow" /> 4.9
                  </p>
                </div>
              </div>
            ))}
            {(earningsData.rides || []).length === 0 ? (
              <p className="text-sm text-gray-500">No completed rides yet.</p>
            ) : null}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-lg font-bold">Available Categories</h3>
          <RideOptions rides={RIDE_TYPES} selectedRide={RIDE_TYPES[0]} onSelect={() => {}} accent="green" />
        </Card>
      </div>
    </div>
  );
}
