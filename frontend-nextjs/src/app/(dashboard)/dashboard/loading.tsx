export default function DashboardPageLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-28 bg-gray-200 rounded-md" />
        <div className="h-4 w-52 bg-gray-100 rounded-md" />
      </div>
      {/* Attendance stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-7 w-8 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Expense card */}
      <div className="card flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-40 bg-gray-100 rounded" />
          <div className="h-8 w-48 bg-gray-200 rounded" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-gray-100" />
      </div>
      {/* Summary grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card text-center space-y-2">
            <div className="h-10 w-10 bg-gray-200 rounded mx-auto" />
            <div className="h-4 w-28 bg-gray-100 rounded mx-auto" />
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
