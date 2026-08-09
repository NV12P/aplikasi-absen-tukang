/**
 * Loading UI untuk semua halaman di (dashboard).
 * Ditampilkan otomatis oleh Next.js saat Server Component sedang fetch data.
 * Menggunakan skeleton pulse sebagai placeholder.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-40 bg-gray-200 rounded-md" />
        <div className="h-4 w-60 bg-gray-100 rounded-md" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-10 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-4 flex-1 bg-gray-100 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-5 w-14 bg-gray-200 rounded-full" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
