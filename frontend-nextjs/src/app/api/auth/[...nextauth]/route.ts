import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Route handler NextAuth — menangani semua /api/auth/* requests
// Setara dengan Laravel Sanctum auth routes
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
