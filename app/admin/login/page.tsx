"use client";
import "../admin.css";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <div style={{ maxWidth: 360, marginTop: 40 }}>
      <h1 className="section-title" style={{ fontSize: 20 }}>
        Admin Login
      </h1>
      <p className="note" style={{ marginBottom: 24 }}>
        Note: Eta shudhu read-only overview dashboard-r jonno simple gate.
        Full store management-r jonno Shopify Admin-e login korben.
      </p>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-dark">
          Login
        </button>
      </form>
    </div>
  );
}
