"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">

      {/* ─── Panel kiri: branding amber ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[420px] flex-shrink-0 bg-amber-gradient relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 left-10 w-56 h-56 rounded-full bg-amber-600/30" />

        <div className="relative z-10 flex flex-col justify-center h-full px-12">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight">Absen Tukang</h1>
          <p className="text-amber-100 mt-3 text-base leading-relaxed">
            Kelola absensi pekerja konstruksi dengan mudah dan efisien.
          </p>

          {/* Feature list */}
          <ul className="mt-10 space-y-3">
            {["Rekap absensi mingguan", "Kalkulasi upah otomatis", "Export laporan Excel", "Manajemen multi-proyek"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/90 text-sm">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Panel kanan: form login ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-stone-50 p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-gradient flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-stone-800 text-lg">Absen Tukang</span>
          </div>

          <h2 className="text-2xl font-bold text-stone-900">Selamat datang</h2>
          <p className="text-stone-500 text-sm mt-1 mb-8">Masuk ke akun administrator</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Error */}
            {error && (
              <div role="alert" className="flex items-center gap-2.5 bg-red-50 border border-red-200
                                           text-red-700 text-sm px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">Email</label>
              <div className="input-group">
                <svg className="input-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <div className="relative">
                <div className="input-group">
                  <svg className="input-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="password" type={showPass ? "text" : "password"}
                    autoComplete="current-password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                  />
                </div>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}>
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full mt-2 py-3 text-base rounded-xl">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Masuk...
                </span>
              ) : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
