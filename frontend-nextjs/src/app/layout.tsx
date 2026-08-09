import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Absen Tukang",
  description: "Aplikasi absensi pekerja konstruksi",
};

/**
 * Root layout — Server Component.
 * Membungkus semua halaman dengan Providers (SessionProvider NextAuth).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
