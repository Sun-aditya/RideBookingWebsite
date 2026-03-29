import { Car, Truck, Users, Clock3 } from "lucide-react";
import { classNames } from "../../utils/helpers";

export default function RideCard({ ride, selected, onSelect, accent = "yellow" }) {
  const accentClasses =
    accent === "green"
      ? "border-brand-green/70 bg-brand-green/10"
      : "border-brand-yellow/70 bg-brand-yellow/10";

  return (
    <button
      onClick={() => {
        console.log("Select ride type", ride.name);
        onSelect?.(ride);
      }}
      className={classNames(
        "w-full rounded-2xl border p-4 text-left transition hover:border-brand-yellow/70",
        selected ? accentClasses : "border-brand-mediumGray bg-brand-darkGray"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-black/40 p-2">
            {ride.icon === "truck" ? <Truck className="h-5 w-5" /> : <Car className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-semibold">{ride.name}</p>
            <p className="text-xs text-gray-400">{ride.capacity} seats</p>
          </div>
        </div>
        <p className="font-bold">{ride.price}</p>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {ride.capacity}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" /> {ride.eta}
        </span>
      </div>
    </button>
  );
}
