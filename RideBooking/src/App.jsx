import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { RideProvider } from "./context/RideContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import BottomBar from "./components/layout/BottomBar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import BookRidePage from "./pages/BookRidePage";
import RideTrackingPage from "./pages/RideTrackingPage";
import RideHistoryPage from "./pages/RideHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentPage from "./pages/PaymentPage";
import DriverDashboard from "./pages/DriverDashboard";

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
};

function RiderLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>
        <main className="min-h-screen flex-1 pb-20 lg:pb-0">
          <Navbar />
          <div className="px-4 pb-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <RideProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#FFFFFF",
              border: "1px solid #2D2D2D",
            },
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Routes location={location}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/unauthorized"
                element={
                  <div className="grid min-h-screen place-items-center bg-black text-white">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold">Unauthorized</h1>
                      <p className="mt-2 text-gray-400">You do not have access to this page.</p>
                    </div>
                  </div>
                }
              />

              <Route element={<ProtectedRoute allowedRoles={["rider"]} />}>
                <Route element={<RiderLayout />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/book" element={<BookRidePage />} />
                  <Route path="/tracking/:rideId" element={<RideTrackingPage />} />
                  <Route path="/history" element={<RideHistoryPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["rider", "driver"]} />}>
                <Route element={<RiderLayout />}>
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["driver"]} />}>
                <Route path="/driver/dashboard" element={<DriverDashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </RideProvider>
    </AuthProvider>
  );
}
