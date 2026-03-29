export default function Loader({ className = "h-5 w-5" }) {
  return (
    <span
      className={`${className} inline-block animate-spin rounded-full border-2 border-brand-mediumGray border-t-brand-yellow`}
      aria-label="Loading"
    />
  );
}
