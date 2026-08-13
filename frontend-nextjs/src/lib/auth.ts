import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma, withRetry } from "@/lib/prisma";

/**
 * Konfigurasi NextAuth.js — menggantikan Laravel Sanctum.
 *
 * Strategi: JWT (stateless) — session disimpan di encrypted cookie, bukan DB.
 * Keuntungan:
 * - Tidak butuh modifikasi tabel users existing Laravel
 * - Cocok untuk Vercel serverless (tidak ada state di server)
 * - User admin dikelola via tabel admin_users (terpisah dari users Laravel)
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        // Cari admin user berdasarkan email — withRetry untuk handle Neon cold start
        const user = await withRetry(() =>
          prisma.adminUser.findUnique({
            where: { email: credentials.email },
          })
        );

        if (!user) {
          throw new Error("Email atau password salah");
        }

        // Verifikasi password dengan bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Email atau password salah");
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],

  callbacks: {
    // Simpan id user ke JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Expose id dari JWT ke session object
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

/**
 * Helper untuk mendapatkan session di Server Components dan API Routes.
 */
export async function auth() {
  return await getServerSession(authOptions);
}
