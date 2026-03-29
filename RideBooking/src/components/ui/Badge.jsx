import { classNames } from "../../utils/helpers";

const styles = {
  default: "bg-brand-mediumGray text-white",
  success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  warning: "bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40",
  danger: "bg-red-500/20 text-red-300 border border-red-500/40",
};

export default function Badge({ children, variant = "default", className }) {
  return (
    <span className={classNames("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", styles[variant], className)}>
      {children}
    </span>
  );
}
