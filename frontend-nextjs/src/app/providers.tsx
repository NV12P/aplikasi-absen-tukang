"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * Global providers — SessionProvider (NextAuth) + ToastProvider.
 * Wajib 'use client' karena keduanya pakai React Context.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
