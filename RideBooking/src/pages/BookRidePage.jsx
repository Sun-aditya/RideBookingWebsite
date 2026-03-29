import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, MapPin, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import RideOptions from "../components/ride/RideOptions";
import { LOCATION_SUGGESTIONS, PAYMENT_METHODS, RIDE_TYPES } from "../utils/constants";
import { useRide } from "../hooks/useRide";

const steps = ["Choose Ride", "Select Vehicle", "Confirm & Pay"];

export default function BookRidePage() {
  const navigate = useNavigate();
  const {
    bookingStep,
    setBookingStep,
    selectedVehicle,
    setSelectedVehicle,
    fareEstimates,
    pickupLocation,
    dropLocation,
    setPickupLocation,
    setDropLocation,
    fetchFareEstimate,
    bookRideRequest,
    loading,
  } = useRide();
  const [pickup, setPickup] = useState(pickupLocation?.address || "Connaught Place");
  const [drop, setDrop] = useState(dropLocation?.address || "IGI Airport");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const vehicleOptions = useMemo(
    () =>
      RIDE_TYPES.map((item) => ({
        ...item,
        price: fareEstimates?.[item.name]?.totalFare
          ? `₹${fareEstimates[item.name].totalFare}`
          : item.price,
      })),
    [fareEstimates]
  );

  useEffect(() => {
    const pickupData = pickupLocation || {
      address: pickup,
      coordinates: { lat: 28.6139, lng: 77.209 },
    };
    const dropData = dropLocation || {
      address: drop,
      coordinates: { lat: 28.5562, lng: 77.1 },
    };

    setPickupLocation(pickupData);
    setDropLocation(dropData);

    fetchFareEstimate(pickupData, dropData).catch((error) => {
      console.log("Initial fare estimate failed", error);
    });
  }, [dropLocation, fetchFareEstimate, pickupLocation, setDropLocation, setPickupLocation, pickup, drop]);

  const estimated = useMemo(() => {
    const selectedName = selectedVehicle?.name || "UberX";
    const selectedFare = fareEstimates?.[selectedName];
    return {
      fare: selectedFare?.totalFare ? `₹${selectedFare.totalFare}` : selectedVehicle?.price || "₹0",
      distance: pickupLocation && dropLocation ? "Calculated" : "--",
      time: pickupLocation && dropLocation ? "Estimated" : "--",
    };
  }, [selectedVehicle, fareEstimates, pickupLocation, dropLocation]);

  const next = () => setBookingStep((prev) => Math.min(prev + 1, 3));
  const back = () => setBookingStep((prev) => Math.max(prev - 1, 1));

  const updateLocationsAndEstimate = async (nextPickupText, nextDropText) => {
    const pickupData = {
      address: nextPickupText,
      coordinates: pickupLocation?.coordinates || { lat: 28.6139, lng: 77.209 },
    };
    const dropData = {
      address: nextDropText,
      coordinates: dropLocation?.coordinates || { lat: 28.5562, lng: 77.1 },
    };

    setPickupLocation(pickupData);
    setDropLocation(dropData);
    if (nextPickupText && nextDropText) {
      await fetchFareEstimate(pickupData, dropData);
    }
  };

  const confirmBooking = async () => {
    const payload = {
      pickupLocation: {
        address: pickup,
        coordinates: pickupLocation?.coordinates || { lat: 28.6139, lng: 77.209 },
      },
      dropLocation: {
        address: drop,
        coordinates: dropLocation?.coordinates || { lat: 28.5562, lng: 77.1 },
      },
      vehicleType: selectedVehicle?.name || "UberX",
      paymentMethod,
    };
    const result = await bookRideRequest(payload);
    if (result?.success && result?.ride?._id) {
      navigate(`/tracking/${result.ride._id}`);
    }
  };

  return (
    <div className="mt-6 mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl border border-brand-mediumGray bg-brand-darkGray p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
          {steps.map((step, index) => (
            <span key={step} className={index + 1 <= bookingStep ? "text-brand-yellow" : ""}>
              {step}
            </span>
          ))}
        </div>
        <div className="h-2 rounded-full bg-black/40">
          <motion.div
            className="h-full rounded-full bg-brand-yellow"
            animate={{ width: `${(bookingStep / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {bookingStep === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="space-y-4">
              <h2 className="text-xl font-bold">Step 1: Choose ride</h2>
              <Input
                label="Pickup"
                icon={MapPin}
                value={pickup}
                onChange={(e) => {
                  const value = e.target.value;
                  setPickup(value);
                  updateLocationsAndEstimate(value, drop).catch((error) => console.log(error));
                }}
              />
              <div className="-mt-2 flex flex-wrap gap-2 text-xs">
                {LOCATION_SUGGESTIONS.slice(0, 3).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      console.log("Pickup suggestion selected", item);
                      setPickup(item);
                      updateLocationsAndEstimate(item, drop).catch((error) => console.log(error));
                    }}
                    className="rounded-full bg-black/40 px-3 py-1 text-gray-300 hover:text-brand-yellow"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <Input
                label="Drop"
                icon={Flag}
                value={drop}
                onChange={(e) => {
                  const value = e.target.value;
                  setDrop(value);
                  updateLocationsAndEstimate(pickup, value).catch((error) => console.log(error));
                }}
              />
              <div className="-mt-2 flex flex-wrap gap-2 text-xs">
                {LOCATION_SUGGESTIONS.slice(3).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      console.log("Drop suggestion selected", item);
                      setDrop(item);
                      updateLocationsAndEstimate(pickup, item).catch((error) => console.log(error));
                    }}
                    className="rounded-full bg-black/40 px-3 py-1 text-gray-300 hover:text-brand-yellow"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 rounded-xl bg-black/40 p-3 sm:grid-cols-3">
                <p className="text-sm text-gray-300">Fare: <span className="font-bold text-white">{estimated.fare}</span></p>
                <p className="text-sm text-gray-300">Distance: <span className="font-bold text-white">{estimated.distance}</span></p>
                <p className="text-sm text-gray-300">Time: <span className="font-bold text-white">{estimated.time}</span></p>
              </div>

              <div className="flex justify-end">
                <Button onClick={next}>Continue</Button>
              </div>
            </Card>
          </motion.div>
        ) : null}

        {bookingStep === 2 ? (
          <motion.div key="step2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="space-y-4">
              <h2 className="text-xl font-bold">Step 2: Select vehicle</h2>
              <RideOptions rides={vehicleOptions} selectedRide={selectedVehicle} onSelect={setSelectedVehicle} />
              <div className="flex justify-between">
                <Button variant="outline" onClick={back}>
                  Back
                </Button>
                <Button onClick={next}>Continue</Button>
              </div>
            </Card>
          </motion.div>
        ) : null}

        {bookingStep === 3 ? (
          <motion.div key="step3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="space-y-4">
              <h2 className="text-xl font-bold">Step 3: Confirm + pay</h2>
              <div className="rounded-xl bg-black/40 p-4 text-sm text-gray-300">
                <p>Pickup: <span className="font-medium text-white">{pickup}</span></p>
                <p className="mt-1">Drop: <span className="font-medium text-white">{drop}</span></p>
                <p className="mt-1">Vehicle: <span className="font-medium text-white">{selectedVehicle.name}</span></p>
                <p className="mt-1">Fare: <span className="font-bold text-brand-yellow">{estimated.fare}</span></p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-300">Payment Method</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        console.log("Select payment method", method);
                        setPaymentMethod(method.toLowerCase());
                      }}
                      className={`rounded-xl border px-3 py-2 text-sm transition ${
                        paymentMethod === method.toLowerCase()
                          ? "border-brand-yellow bg-brand-yellow/10 text-brand-yellow"
                          : "border-brand-mediumGray text-gray-300 hover:border-brand-yellow/60"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={back}>
                  Back
                </Button>
                <Button className="relative overflow-hidden" onClick={confirmBooking} loading={loading}>
                  <span className="absolute inset-0 -z-10 animate-pulse bg-brand-yellow/30" />
                  <Wallet className="h-4 w-4" /> Confirm Booking
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
