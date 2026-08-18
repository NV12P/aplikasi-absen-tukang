"use client";

import { useState } from "react";
import { MasterDataClient } from "./MasterDataClient";
import { ForemanClient } from "./ForemanClient";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<"positions" | "foremen">("positions");

  return (
    <div>
      {/* Tabs */}
      <div style={{ 
        borderBottom: "2px solid var(--border-color)", 
        marginBottom: "24px",
        display: "flex",
        gap: "8px",
      }}>
        <button
          onClick={() => setActiveTab("positions")}
          style={{
            padding: "12px 24px",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === "positions" ? "3px solid var(--accent-color)" : "3px solid transparent",
            color: activeTab === "positions" ? "var(--accent-color)" : "var(--text-muted)",
            fontWeight: activeTab === "positions" ? 600 : 400,
            fontSize: "15px",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: "-2px",
          }}
        >
          Jabatan
        </button>
        <button
          onClick={() => setActiveTab("foremen")}
          style={{
            padding: "12px 24px",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === "foremen" ? "3px solid var(--accent-color)" : "3px solid transparent",
            color: activeTab === "foremen" ? "var(--accent-color)" : "var(--text-muted)",
            fontWeight: activeTab === "foremen" ? 600 : 400,
            fontSize: "15px",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: "-2px",
          }}
        >
          Kepala Tukang
        </button>
      </div>

      {/* Content */}
      {activeTab === "positions" ? <MasterDataClient /> : <ForemanClient />}
    </div>
  );
}
