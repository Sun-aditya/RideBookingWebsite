import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CarFront, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { RIDE_TYPES } from "../utils/constants";
import { useRide } from "../hooks/useRide";

const filters = ["All", "Completed", "Cancelled"];

export default function RideHistoryPage() {
  const navigate = useNavigate();
  const { setSelectedVehicle, fetchRideHistory } = useRide();
  const [activeFilter, setActiveFilter] = useState("All");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allRides, setAllRides] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      const data = await fetchRideHistory({ page: 1, limit: 100 });
      setAllRides(data?.rides || []);
    };
    loadAll();
  }, [fetchRideHistory]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const statusParam =
        activeFilter === "Completed"
          ? "completed"
          : activeFilter === "Cancelled"
          ? "cancelled"
          : undefined;
      const data = await fetchRideHistory({ page: 1, limit: 10, status: statusParam });
      setRides(data?.rides || []);
      setLoading(false);
    };
    load();
  }, [activeFilter, fetchRideHistory]);

  const counts = useMemo(
    () => ({
      All: allRides.length,
      Completed: allRides.filter((r) => r.status === "completed").length,
      Cancelled: allRides.filter((r) => r.status === "cancelled").length,
    }),
    [allRides]
  );

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-brand-mediumGray p-2 transition hover:border-brand-yellow"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold">Ride History</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              console.log("Apply history filter", filter);
              setActiveFilter(filter);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              activeFilter === filter
                ? "border-brand-yellow bg-brand-yellow/10 text-brand-yellow"
                : "border-brand-mediumGray text-gray-300 hover:border-brand-yellow/60"
            }`}
          >
            {filter} <span className="text-xs text-gray-400">({counts[filter]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="h-28 animate-pulse bg-brand-darkGray/60" />
          ))}
        </div>
      ) : null}

      {!loading && rides.length === 0 ? (
        <Card className="grid place-items-center py-14 text-center">
          <CarFront className="h-12 w-12 text-gray-500" />
          <p className="mt-3 text-lg font-semibold">No rides found</p>
          <p className="text-sm text-gray-400">Your completed rides will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rides.map((ride) => (
            <Card key={ride._id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-sm text-gray-400">
                  <CalendarDays className="h-4 w-4" /> {new Date(ride.createdAt).toLocaleString()}
                </p>
                <Badge variant={ride.status === "completed" ? "success" : "danger"}>
                  {String(ride.status || "").replace("_", " ")}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{ride.pickupLocation?.address || "--"}</span>
                <ArrowRight className="h-4 w-4 text-brand-yellow" />
                <span className="font-medium">{ride.dropLocation?.address || "--"}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">{ride.vehicleType}</p>
                  <p className="text-lg font-bold">₹{ride.fare?.totalFare || 0}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const match = RIDE_TYPES.find((type) => type.name === ride.vehicleType);
                    if (match) setSelectedVehicle(match);
                    console.log("Rebook ride", ride._id);
                    navigate("/book");
                  }}
                >
                  Rebook
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
