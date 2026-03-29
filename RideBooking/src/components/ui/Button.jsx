import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { classNames } from "../../utils/helpers";

const variantClasses = {
  primary:
    "bg-brand-yellow text-black hover:bg-[#e9ba17] focus-visible:ring-brand-yellow border border-transparent",
  secondary:
    "bg-brand-darkGray text-white hover:bg-brand-mediumGray focus-visible:ring-brand-mediumGray border border-transparent",
  outline:
    "bg-transparent text-white border border-brand-mediumGray hover:border-brand-yellow hover:text-brand-yellow focus-visible:ring-brand-yellow",
  danger:
    "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500 border border-transparent",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      disabled={loading || disabled}
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </motion.button>
  );
}
