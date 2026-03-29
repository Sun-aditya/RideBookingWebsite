import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    navigate(role === "driver" ? "/driver/dashboard" : "/home");
  }, [isAuthenticated, navigate, role]);

  return (
    <div className="min-h-screen bg-black px-4 py-6 sm:px-8">
      <div className="mx-auto grid min-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-brand-mediumGray md:grid-cols-2">
        <div className="relative hidden bg-brand-darkGray p-10 md:block">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold">RideFlow</h1>
            <p className="mt-3 max-w-sm text-gray-300">Welcome back. Move smarter across the city.</p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-brand-yellow/25 blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center bg-[#070707] p-6 sm:p-10"
        >
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-2xl font-bold">Sign In</h2>
            <p className="mt-1 text-sm text-gray-400">Access your account to book rides instantly.</p>
            <div className="mt-6">
              <LoginForm />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
