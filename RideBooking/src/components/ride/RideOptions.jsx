import RideCard from "./RideCard";

export default function RideOptions({ rides, selectedRide, onSelect, accent }) {
  return (
    <div className="grid gap-3">
      {rides.map((ride) => (
        <RideCard
          key={ride.id}
          ride={ride}
          selected={selectedRide?.id === ride.id}
          onSelect={onSelect}
          accent={accent}
        />
      ))}
    </div>
  );
}
