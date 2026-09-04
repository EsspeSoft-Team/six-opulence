"use client";

import "../auth.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.push("/account");
    } else {
      setError(result.error || "Login failed. Check your credentials.");
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-image">
        <Image
          src="/placeholders/auth-1.svg"
          alt=""
          fill
          style={{ objectFit: "cover" }}
        />
        <div className="auth-image-overlay">
          <p className="hero-eyebrow">Opulence</p>
          <h2>WELCOME BACK.</h2>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <p className="section-eyebrow">Login</p>
          <h1 className="auth-title">Sign In To Your Account</h1>

          <form onSubmit={handleSubmit} className="form" style={{ marginTop: 32 }}>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-solid" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="muted-link">
            Don't have an account? <Link href="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
