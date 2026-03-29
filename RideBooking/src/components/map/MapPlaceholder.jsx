import { motion } from "framer-motion";

const pings = [
  { id: 1, left: "14%", top: "20%", delay: 0.1 },
  { id: 2, left: "36%", top: "52%", delay: 0.6 },
  { id: 3, left: "68%", top: "34%", delay: 1.1 },
  { id: 4, left: "82%", top: "70%", delay: 1.5 },
];

export default function MapPlaceholder({ className = "h-full min-h-[260px]" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-brand-mediumGray bg-[#0f0f0f] ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-brand-yellow/10" />

      {pings.map((ping) => (
        <div key={ping.id} className="absolute" style={{ left: ping.left, top: ping.top }}>
          <motion.div
            className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-brand-yellow/50"
            animate={{ scale: [1, 1.7, 1], opacity: [0.7, 0.2, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.8, delay: ping.delay }}
          />
          <div className="h-2.5 w-2.5 rounded-full bg-brand-yellow shadow-glow" />
        </div>
      ))}

      <p className="absolute bottom-3 right-3 text-xs text-gray-500">Map View</p>
    </div>
  );
}
