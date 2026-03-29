import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Flag, MapPin, Star } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import RideOptions from "../components/ride/RideOptions";
import MapPlaceholder from "../components/map/MapPlaceholder";
import { QUICK_DESTINATIONS, RIDE_TYPES } from "../utils/constants";
import { getCurrentDateLong, getGreetingByTime } from "../utils/helpers";
import { useAuth } from "../hooks/useAuth";
import { useRide } from "../hooks/useRide";
import useLocation from "../hooks/useLocation";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedVehicle,
    setSelectedVehicle,
    fareEstimates,
    nearbyDrivers,
    fetchNearbyDrivers,
    fetchFareEstimate,
    fetchActiveRide,
    setPickupLocation,
    setDropLocation,
  } = useRide();
  const { getCurrentLocation } = useLocation();

  const [pickupText, setPickupText] = useState("");
  const [dropText, setDropText] = useState("");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const activeRide = await fetchActiveRide();
        if (activeRide?._id) {
          navigate(`/tracking/${activeRide._id}`);
          return;
        }

        const current = await getCurrentLocation();
        setCoords(current);
        await fetchNearbyDrivers(current.latitude, current.longitude);
      } catch (error) {
        console.log("Home initialization error", error);
        toast.error("Unable to connect to server");
      }
    };

    initialize();
  }, [fetchActiveRide, fetchNearbyDrivers, getCurrentLocation, navigate]);

  const rideOptions = useMemo(() => {
    return RIDE_TYPES.slice(0, 3).map((rideType) => ({
      ...rideType,
      price: fareEstimates?.[rideType.name]?.totalFare
        ? `₹${fareEstimates[rideType.name].totalFare}`
        : rideType.price,
    }));
  }, [fareEstimates]);

  const onEstimate = async (nextPickupText, nextDropText) => {
    if (!coords || !nextPickupText || !nextDropText) return;

    const pickup = {
      address: nextPickupText,
      coordinates: { lat: coords.latitude, lng: coords.longitude },
    };
    const drop = {
      address: nextDropText,
      coordinates: { lat: coords.latitude + 0.015, lng: coords.longitude + 0.02 },
    };

    setPickupLocation(pickup);
    setDropLocation(drop);

    try {
      await fetchFareEstimate(pickup, drop);
    } catch (error) {
      console.log("Fare estimate from home failed", error);
    }
  };

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreetingByTime()}, {user?.fullName?.split(" ")[0] || "Rider"}
          </h1>
          <p className="mt-1 inline-flex items-center gap-2 text-sm text-gray-400">
            <CalendarDays className="h-4 w-4" /> {getCurrentDateLong()}
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-brand-mediumGray bg-brand-darkGray p-4">
          <Input
            label="Pickup"
            icon={MapPin}
            placeholder="Enter pickup location"
            value={pickupText}
            onChange={(e) => {
              const value = e.target.value;
              setPickupText(value);
              onEstimate(value, dropText);
            }}
          />
          <Input
            label="Destination"
            icon={Flag}
            placeholder="Where to?"
            value={dropText}
            onChange={(e) => {
              const value = e.target.value;
              setDropText(value);
              onEstimate(pickupText, value);
            }}
          />

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Quick Destinations</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_DESTINATIONS.map((destination) => (
                <button
                  key={destination}
                  onClick={() => {
                    setDropText(destination);
                    onEstimate(pickupText, destination);
                  }}
                  className="rounded-full border border-brand-mediumGray px-3 py-1.5 text-xs text-gray-300 transition hover:border-brand-yellow hover:text-brand-yellow"
                >
                  {destination}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-mediumGray bg-brand-darkGray p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300">Ride Type</h2>
          <RideOptions rides={rideOptions} selectedRide={selectedVehicle} onSelect={setSelectedVehicle} />
          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={() => {
              console.log("Book now clicked from home page");
              navigate("/book");
            }}
          >
            Book Now
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <MapPlaceholder className="h-[60vh] lg:h-[calc(100vh-180px)]" />

        <div className="rounded-xl border border-brand-mediumGray bg-brand-darkGray p-3 text-sm text-gray-300">
          {nearbyDrivers.length} drivers nearby
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-brand-mediumGray bg-brand-darkGray p-3">
          <div className="rounded-xl bg-black/40 p-3 text-center">
            <p className="text-xs text-gray-400">Total rides</p>
            <p className="mt-1 text-xl font-bold">{user?.totalRides ?? 0}</p>
          </div>
          <div className="rounded-xl bg-black/40 p-3 text-center">
            <p className="text-xs text-gray-400">Money saved</p>
            <p className="mt-1 text-xl font-bold">₹5,420</p>
          </div>
          <div className="rounded-xl bg-black/40 p-3 text-center">
            <p className="text-xs text-gray-400">Rating</p>
            <p className="mt-1 inline-flex items-center justify-center gap-1 text-xl font-bold">
              {Number(user?.averageRating || 0).toFixed(1)} <Star className="h-4 w-4 text-brand-yellow" />
            </p>
          </div>
        </div>
        <Badge variant="warning">Peak pricing may apply in selected regions.</Badge>
      </section>
    </div>
  );
}
