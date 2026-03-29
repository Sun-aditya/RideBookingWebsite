export default function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-black">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-mediumGray border-t-brand-yellow" />
        <p className="mt-4 text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
