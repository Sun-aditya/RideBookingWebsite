import { classNames } from "../../utils/helpers";

export default function Card({ children, className }) {
  return (
    <div
      className={classNames(
        "rounded-2xl border border-brand-mediumGray bg-brand-darkGray/80 p-4 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
