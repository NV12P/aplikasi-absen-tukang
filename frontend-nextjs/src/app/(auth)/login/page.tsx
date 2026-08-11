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
    <div className="login-page">

      {/* ─── Panel kiri: branding ─────────────────────────────────────────── */}
      <div className="login-branding">
        <h1>CV Fortuna Aeterna</h1>
        <p>Enterprise Construction Management</p>
      </div>

      {/* ─── Panel kanan: form login ──────────────────────────────────────── */}
      <div className="login-form-wrapper">
        <div className="card login-card">

          {/* Header card */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
              Login Admin
            </h2>
            <p style={{ color: "var(--text-muted)" }}>
              Silakan masuk untuk mengelola proyek dan pekerja.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                backgroundColor: "var(--danger-bg)",
                color: "var(--danger)",
                borderRadius: "6px",
                marginBottom: "20px",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            noValidate
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Email
              </label>
              <div className="input-group">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  placeholder="admin@absen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <div className="input-group" style={{ position: "relative" }}>
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: "40px", paddingRight: "40px" }}
                />
                {/* Toggle show/hide password */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showPass ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                padding: "14px",
                justifyContent: "center",
                fontSize: "16px",
                marginTop: "8px",
                width: "100%",
                borderRadius: "8px",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg
                    className="login-spinner"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      style={{ opacity: 0.25 }}
                      cx="12" cy="12" r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      style={{ opacity: 0.75 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
