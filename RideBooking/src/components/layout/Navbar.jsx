import { Bell, UserCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-mediumGray/60 bg-black/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-yellow" />
          <span className="text-lg font-bold">RideFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="rounded-full border border-brand-mediumGray p-2 transition hover:border-brand-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
            onClick={() => console.log("Open notifications")}
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-brand-mediumGray px-2 py-1">
            <UserCircle2 className="h-5 w-5 text-brand-yellow" />
            <span className="hidden text-sm text-gray-300 sm:inline">{user?.fullName || "Guest"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
