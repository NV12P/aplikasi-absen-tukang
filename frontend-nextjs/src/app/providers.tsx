"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import { SplashScreen } from "@/components/ui/SplashScreen";

/**
 * Global providers — SessionProvider (NextAuth) + ToastProvider.
 * Wajib 'use client' karena keduanya pakai React Context.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <SplashScreen />
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
