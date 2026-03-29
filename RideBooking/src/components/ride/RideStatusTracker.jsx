import { Check } from "lucide-react";
import { classNames } from "../../utils/helpers";

const steps = ["Driver Assigned", "Driver Arriving", "Ride in Progress", "Completed"];

export default function RideStatusTracker({ currentStep = 0 }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const completed = index < currentStep;
          const current = index === currentStep;
          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={classNames(
                    "grid h-7 w-7 place-items-center rounded-full border text-xs",
                    completed
                      ? "border-brand-yellow bg-brand-yellow text-black"
                      : current
                      ? "animate-pulse border-brand-yellow text-brand-yellow"
                      : "border-brand-mediumGray text-gray-500"
                  )}
                >
                  {completed ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <p className="text-center text-[10px] text-gray-400 sm:text-xs">{step}</p>
              </div>
              {index < steps.length - 1 ? (
                <div className="mx-2 h-[2px] flex-1 bg-brand-mediumGray">
                  <div
                    className={classNames("h-full transition-all", index < currentStep ? "w-full bg-brand-yellow" : "w-0")}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
