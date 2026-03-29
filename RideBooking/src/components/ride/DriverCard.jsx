import { Phone, Star } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function DriverCard({ driver }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-yellow font-bold text-black">
          {driver.avatar}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{driver.name}</p>
          <p className="text-xs text-gray-400">
            {driver.car} • {driver.plate}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-mediumGray px-2 py-1 text-xs">
          <Star className="h-3.5 w-3.5 text-brand-yellow" /> {driver.rating}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => console.log("Call driver", driver.phone)}
      >
        <Phone className="h-4 w-4" /> Call Driver
      </Button>
    </Card>
  );
}
