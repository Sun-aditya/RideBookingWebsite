import { CarFront, CircleUserRound, CreditCard, History, Home, MapPinned, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { classNames } from "../../utils/helpers";

const links = [
  { label: "Home", to: "/home", icon: Home },
  { label: "Book Ride", to: "/book", icon: CarFront },
  { label: "Tracking", to: "/tracking/active", icon: MapPinned },
  { label: "History", to: "/history", icon: History },
  { label: "Payment", to: "/payment", icon: CreditCard },
  { label: "Profile", to: "/profile", icon: CircleUserRound },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="sticky top-0 flex h-screen w-64 flex-col border-r border-brand-mediumGray bg-[#090909] p-4">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-lg bg-brand-yellow" />
        <span className="text-xl font-bold">RideFlow</span>
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-brand-yellow text-black"
                    : "text-gray-300 hover:bg-brand-darkGray hover:text-white"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => {
          console.log("Logout from sidebar");
          logout();
          navigate("/login");
        }}
        className="mt-auto flex items-center gap-2 rounded-xl border border-red-500/40 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );
}
