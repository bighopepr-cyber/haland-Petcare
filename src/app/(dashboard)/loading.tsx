export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="col-span-3 h-64 animate-pulse rounded-xl bg-gray-100" />
        <div className="col-span-2 h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}