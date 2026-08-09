import Link from "next/link";

/**
 * Halaman 404 global — ditampilkan untuk semua route yang tidak ditemukan.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Halaman tidak ditemukan
        </h1>
        <p className="text-gray-500 mb-8">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
