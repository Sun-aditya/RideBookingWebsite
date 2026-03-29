import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Chrome, Lock, Mail, Phone, UserCircle2 } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { classNames } from "../../utils/helpers";

export default function SignupForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "rider",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [driverSuccess, setDriverSuccess] = useState("");

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    if (!form.password.trim()) next.password = "Password is required";
    if (form.password.length < 6) next.password = "Minimum 6 characters";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setServerError("");
    setDriverSuccess("");
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      };

      if (form.role === "driver") {
        payload.vehicle = {
          make: "Maruti",
          model: "Dzire",
          year: 2022,
          color: "White",
          plateNumber: "DL 01 AB 1234",
          type: "UberX",
        };
      }

      const result = await register(payload, form.role);
      if (!result.success) {
        setServerError(result.error?.message || "Unable to signup");
        return;
      }

      if (form.role === "driver") {
        setDriverSuccess("Registration submitted! Await admin approval.");
        return;
      }

      toast.success("Account created successfully");
      navigate("/home");
    } catch (error) {
      console.log("Signup failure", error);
      setServerError(error?.message || "Unable to connect to server");
      toast.error(error?.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Full Name"
        icon={UserCircle2}
        value={form.fullName}
        onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
        error={errors.fullName}
      />
      <Input
        label="Email"
        icon={Mail}
        value={form.email}
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        error={errors.email}
      />
      <Input
        label="Phone Number"
        icon={Phone}
        value={form.phone}
        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        error={errors.phone}
      />
      <Input
        label="Password"
        icon={Lock}
        type="password"
        value={form.password}
        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        error={errors.password}
      />
      <Input
        label="Confirm Password"
        icon={Lock}
        type="password"
        value={form.confirmPassword}
        onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
        error={errors.confirmPassword}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-300">Role</p>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-brand-darkGray p-1">
          {["rider", "driver"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                console.log("Select signup role", role);
                setForm((prev) => ({ ...prev, role }));
              }}
              className={classNames(
                "rounded-lg px-3 py-2 text-sm font-medium capitalize transition",
                form.role === role ? "bg-brand-yellow text-black" : "text-gray-300 hover:bg-brand-mediumGray"
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Create Account
      </Button>

      {serverError ? <p className="text-sm text-red-400">{serverError}</p> : null}
      {driverSuccess ? <p className="text-sm text-emerald-400">{driverSuccess}</p> : null}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => console.log("Continue with Google")}
      >
        <Chrome className="h-4 w-4" /> Continue with Google
      </Button>

      <p className="text-center text-sm text-gray-400">
        Already registered?{" "}
        <Link to="/login" className="font-medium text-brand-yellow hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
