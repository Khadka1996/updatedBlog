export default function Loading() {
  return (
    <main aria-label="Loading Everestkit" className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="h-12 w-12 animate-pulse rounded-full bg-[#4caf4f]/20" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-gray-600">Loading Everestkit...</p>
      </div>
    </main>
  );
}
