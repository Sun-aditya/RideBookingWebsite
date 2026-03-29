import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Car, ShieldCheck, TimerReset, WalletCards } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const features = [
  { title: "Safety", icon: ShieldCheck, text: "Real-time trip tracking and trusted drivers." },
  { title: "Speed", icon: TimerReset, text: "Get matched in seconds, not minutes." },
  { title: "Affordable", icon: WalletCards, text: "Transparent pricing with smart ride choices." },
];

const steps = [
  "Set your pickup and destination",
  "Select a ride that fits your budget",
  "Track your trip from start to finish",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(245,197,24,0.28),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(245,197,24,0.16),transparent_35%)]" />

        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            >
              Your Ride, <span className="text-brand-yellow">On Demand</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mt-5 max-w-lg text-gray-300"
            >
              Fast, safe, and reliable rides at your fingertips.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/book">
                <Button size="lg">Book a Ride</Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="border-white text-white hover:border-brand-yellow">
                  Drive with Us
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, -2, 0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="mx-auto grid h-60 w-60 place-items-center rounded-full border border-brand-yellow/30 bg-brand-yellow/10 sm:h-72 sm:w-72"
            >
              <Car className="h-24 w-24 text-brand-yellow" />
            </motion.div>
            <div className="absolute -bottom-4 left-1/2 h-8 w-40 -translate-x-1/2 rounded-full bg-brand-yellow/20 blur-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <Icon className="mb-3 h-7 w-7 text-brand-yellow" />
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{feature.text}</p>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8 lg:px-12">
        <h2 className="text-2xl font-bold">How It Works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step} className="flex items-start gap-4">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-yellow font-bold text-black">
                {index + 1}
              </div>
              <p className="text-sm text-gray-300">{step}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-brand-mediumGray px-4 py-6 text-sm text-gray-400 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RideFlow. All rights reserved.</p>
          <div className="flex gap-4">
            <button className="hover:text-white">Privacy</button>
            <button className="hover:text-white">Terms</button>
            <button className="hover:text-white">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
