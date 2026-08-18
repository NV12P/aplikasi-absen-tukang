"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7.5a4.5 4.5 0 019 0v.255a6 6 0 015.477 8.135M3 7.5a6 6 0 0010.005 5.61M3 7.5l4.5 4.5m0 0a6 6 0 008.49 0M7.5 12l4.5 4.5"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tidak Ada Koneksi</h1>
        <p className="text-gray-500 mb-6">
          Sepertinya kamu sedang offline. Periksa koneksi internet kamu dan coba lagi.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
