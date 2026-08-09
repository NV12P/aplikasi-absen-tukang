import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Root page — redirect ke dashboard jika sudah login, ke login jika belum.
 * Server Component — tidak perlu 'use client'.
 */
export default async function RootPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
