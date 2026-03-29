import { useEffect } from "react";
import { MessageCircle, Phone, ShieldAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import MapPlaceholder from "../components/map/MapPlaceholder";
import RideStatusTracker from "../components/ride/RideStatusTracker";
import DriverCard from "../components/ride/DriverCard";
import Button from "../components/ui/Button";
import { useRide } from "../hooks/useRide";
import useSocket from "../hooks/useSocket";

const statusToStep = {
  accepted: 0,
  driver_arriving: 1,
  in_progress: 2,
  completed: 3,
};

export default function RideTrackingPage() {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const {
    rideStatus,
    currentRide,
    driverLocation,
    fetchActiveRide,
    fetchRideById,
    cancelCurrentRide,
  } = useRide();
  const { subscribeToMessages } = useSocket();

  useEffect(() => {
    const initialize = async () => {
      if (rideId && rideId !== "active") {
        await fetchRideById(rideId);
      } else {
        const activeRide = await fetchActiveRide();
        if (!activeRide?._id) {
          navigate("/home");
        }
      }
    };

    initialize();
  }, [fetchActiveRide, fetchRideById, navigate, rideId]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchActiveRide().catch((error) => console.log("Ride polling failed", error));
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchActiveRide]);

  useEffect(() => {
    const cleanup = subscribeToMessages((message) => {
      console.log("Incoming tracking chat message", message);
    });
    return cleanup;
  }, [subscribeToMessages]);

  const driver = {
    avatar: currentRide?.driver?.fullName
      ? currentRide.driver.fullName
          .split(" ")
          .map((x) => x[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "DR",
    name: currentRide?.driver?.fullName || "Searching for driver",
    car:
      `${currentRide?.driver?.vehicle?.make || ""} ${currentRide?.driver?.vehicle?.model || ""}`.trim() ||
      currentRide?.vehicleType ||
      "--",
    plate: currentRide?.driver?.vehicle?.plateNumber || "--",
    rating: currentRide?.driver?.averageRating || 0,
    phone: currentRide?.driver?.phone || "--",
  };

  const stepIndex = statusToStep[rideStatus] ?? 0;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-brand-mediumGray bg-brand-darkGray">
      <MapPlaceholder className="h-[60vh] rounded-none border-0" />

      <div className="space-y-4 rounded-t-3xl border-t border-brand-mediumGray bg-[#090909] p-4 sm:p-6">
        <RideStatusTracker currentStep={stepIndex} />

        <div className="rounded-xl bg-black/40 p-3 text-sm text-gray-300">
          <p>Pickup: {currentRide?.pickupLocation?.address || "--"}</p>
          <p>Drop: {currentRide?.dropLocation?.address || "--"}</p>
        </div>

        <DriverCard driver={driver} />

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {driverLocation?.latitude && driverLocation?.longitude
            ? `Driver moving: ${driverLocation.latitude.toFixed(4)}, ${driverLocation.longitude.toFixed(4)}`
            : "Waiting for live driver location"}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="danger"
            onClick={() => {
              console.log("SOS tapped");
              toast.error("Emergency signal sent");
            }}
          >
            <ShieldAlert className="h-4 w-4" /> SOS
          </Button>
          <Button variant="secondary" onClick={() => console.log("Chat tapped")}> 
            <MessageCircle className="h-4 w-4" /> Chat
          </Button>
          <Button variant="secondary" onClick={() => console.log("Call tapped")}>
            <Phone className="h-4 w-4" /> Call
          </Button>
        </div>

        <button
          onClick={async () => {
            console.log("Ride cancelled");
            await cancelCurrentRide("Cancelled from tracking page");
            toast("Ride cancelled");
            navigate("/home");
          }}
          className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
        >
          Cancel ride
        </button>
      </div>
    </div>
  );
}
