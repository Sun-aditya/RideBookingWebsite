import {
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPinned,
  Pencil,
  Bell,
  Shield,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../api/authApi";

const menu = [
  { label: "Edit Profile", icon: UserRound },
  { label: "Payment Methods", icon: CreditCard },
  { label: "Saved Places", icon: MapPinned },
  { label: "Notifications", icon: Bell },
  { label: "Help & Support", icon: HelpCircle },
  { label: "Privacy Policy", icon: Shield },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  const saveProfile = async () => {
    try {
      const response = await updateProfile(form);
      console.log("Update profile response", response);
      const updated = response?.user || response?.data?.user || null;
      if (updated) {
        updateUser(updated);
        toast.success("Profile updated");
      }
      setIsEditing(false);
    } catch (error) {
      console.log("Update profile error", error);
      toast.error(error?.message || "Unable to connect to server");
    }
  };

  return (
    <div className="mt-6 space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="relative">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-yellow text-2xl font-bold text-black">
              {user?.avatar || "AR"}
            </div>
            <button
              onClick={() => console.log("Edit avatar")}
              className="absolute bottom-0 right-0 rounded-full bg-black p-2 text-brand-yellow"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.fullName || "Alex Rider"}</h1>
            <p className="text-sm text-gray-400">{user?.email || "alex@example.com"}</p>
            <p className="text-sm text-gray-400">{user?.phone || "+91 99999 88888"}</p>
            <p className="mt-1 text-xs text-gray-500">Member since {user?.memberSince || "Jan 2024"}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-black/40 p-4 text-center">
            <p className="text-xs text-gray-400">Total rides</p>
            <p className="text-xl font-bold">{user?.totalRides ?? 0}</p>
          </div>
          <div className="rounded-xl bg-black/40 p-4 text-center">
            <p className="text-xs text-gray-400">Avg rating</p>
            <p className="text-xl font-bold">{Number(user?.averageRating || 0).toFixed(1)}</p>
          </div>
          <div className="rounded-xl bg-black/40 p-4 text-center">
            <p className="text-xs text-gray-400">Total spent</p>
            <p className="text-xl font-bold">₹24,860</p>
          </div>
        </div>

        {isEditing ? (
          <div className="grid gap-2 rounded-xl border border-brand-mediumGray p-3">
            <input
              className="rounded-lg border border-brand-mediumGray bg-black/40 px-3 py-2 text-sm outline-none"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Full name"
            />
            <input
              className="rounded-lg border border-brand-mediumGray bg-black/40 px-3 py-2 text-sm outline-none"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone"
            />
            <input
              className="rounded-lg border border-brand-mediumGray bg-black/40 px-3 py-2 text-sm outline-none"
              value={form.avatar}
              onChange={(e) => setForm((prev) => ({ ...prev, avatar: e.target.value }))}
              placeholder="Avatar text"
            />
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-brand-yellow px-3 py-2 text-sm font-medium text-black"
                onClick={saveProfile}
              >
                Save
              </button>
              <button
                className="rounded-lg border border-brand-mediumGray px-3 py-2 text-sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                console.log("Profile menu clicked", item.label);
                if (item.label === "Payment Methods") navigate("/payment");
                if (item.label === "Edit Profile") setIsEditing(true);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-brand-mediumGray bg-brand-darkGray px-4 py-3 transition hover:border-brand-yellow"
            >
              <span className="inline-flex items-center gap-3">
                <Icon className="h-4 w-4 text-brand-yellow" />
                <span className="text-sm">{item.label}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          );
        })}

        <button
          onClick={() => {
            console.log("Profile logout");
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center justify-between rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300 transition hover:bg-red-500/20"
        >
          <span className="inline-flex items-center gap-3">
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
