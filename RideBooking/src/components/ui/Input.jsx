import { classNames } from "../../utils/helpers";

export default function Input({
  label,
  icon: Icon,
  error,
  className,
  wrapperClassName,
  ...props
}) {
  return (
    <div className={classNames("w-full", wrapperClassName)}>
      {label ? <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label> : null}
      <div
        className={classNames(
          "flex h-11 items-center gap-2 rounded-xl border bg-brand-darkGray px-3 transition-all duration-200 focus-within:border-brand-yellow",
          error ? "border-red-500" : "border-brand-mediumGray"
        )}
      >
        {Icon ? <Icon className="h-4 w-4 text-gray-400" /> : null}
        <input
          className={classNames(
            "h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500",
            className
          )}
          {...props}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
