import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

/**
 * Dashboard layout — Server Component.
 * Menggantikan kombinasi ProtectedRoute + MainLayout di React lama.
 * Auth check di server = tidak ada flash/redirect di client.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cek session di server — jika belum login, redirect ke /login
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar navigasi */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
