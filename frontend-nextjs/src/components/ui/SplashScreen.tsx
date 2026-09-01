"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  // fase: "visible" → "hiding" → "hidden"
  const [phase, setPhase] = useState<"visible" | "hiding" | "hidden">("visible");

  useEffect(() => {
    // Mulai fade-out setelah 1.8 detik
    const fadeTimer = setTimeout(() => setPhase("hiding"), 1800);
    // Hapus dari DOM setelah animasi selesai (0.6 detik)
    const removeTimer = setTimeout(() => setPhase("hidden"), 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.6s ease",
        opacity: phase === "hiding" ? 0 : 1,
      }}
    >
      {/* Lingkaran cahaya di belakang icon */}
      <div
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(242,199,0,0.18) 0%, rgba(242,199,0,0) 70%)",
          animation: "pulse-glow 2s ease-in-out infinite",
        }}
      />

      {/* Icon */}
      <div
        style={{
          position: "relative",
          width: 100,
          height: 100,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(242,199,0,0.25)",
          animation: "pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        <Image
          src="/icon-192x192.png"
          alt="Absen Tukang"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Nama app */}
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          animation: "fade-up 0.5s ease 0.3s both",
        }}
      >
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 24,
            color: "#ffffff",
            letterSpacing: "-0.3px",
          }}
        >
          Absen Tukang
        </p>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            marginTop: 4,
            letterSpacing: "0.5px",
          }}
        >
          AKSNESIA DEV
        </p>
      </div>

      {/* Loading dots */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          display: "flex",
          gap: 6,
          animation: "fade-up 0.5s ease 0.6s both",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#f2c700",
              animation: `dot-bounce 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pop-in {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fade-up {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1;   }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%       { transform: scale(1.15); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
