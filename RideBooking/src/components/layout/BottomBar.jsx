import { CarFront, History, Home, MapPinned, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { classNames } from "../../utils/helpers";

const links = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/book", label: "Book", icon: CarFront },
  { to: "/tracking/active", label: "Track", icon: MapPinned },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function BottomBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-mediumGray bg-black/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames(
                  "flex flex-col items-center rounded-lg px-2 py-1 text-[11px] transition",
                  isActive ? "text-brand-yellow" : "text-gray-400 hover:text-white"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
