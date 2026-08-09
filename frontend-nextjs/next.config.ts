import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ExcelJS perlu dijalankan di server side (tidak di-bundle untuk edge)
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
