import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Chrome } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { classNames } from "../../utils/helpers";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: true, role: "rider" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email";
    if (!form.password.trim()) next.password = "Password is required";
    if (form.password.trim() && form.password.length < 6) next.password = "Minimum 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setServerError("");
    setLoading(true);
    try {
      const result = await login(form.email, form.password, form.role);
      if (!result.success) {
        setServerError(result.error?.message || "Unable to login");
        return;
      }

      if (result.role === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.log("Login error", error);
      setServerError(error?.message || "Unable to connect to server");
      toast.error(error?.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Email"
        icon={Mail}
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        icon={Lock}
        placeholder="Enter password"
        value={form.password}
        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        error={errors.password}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-300">Login As</p>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-brand-darkGray p-1">
          {["rider", "driver"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, role }))}
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

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-gray-400">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-brand-mediumGray bg-brand-darkGray"
            checked={form.remember}
            onChange={(e) => setForm((prev) => ({ ...prev, remember: e.target.checked }))}
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() => console.log("Forgot password clicked")}
          className="text-brand-yellow hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Sign In
      </Button>

      {serverError ? <p className="text-sm text-red-400">{serverError}</p> : null}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => console.log("Continue with Google")}
      >
        <Chrome className="h-4 w-4" /> Continue with Google
      </Button>

      <p className="text-center text-sm text-gray-400">
        New here?{" "}
        <Link to="/signup" className="font-medium text-brand-yellow hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}
