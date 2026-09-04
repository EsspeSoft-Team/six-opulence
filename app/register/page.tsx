"use client";

import "../auth.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(form.email, form.password, form.firstName, form.lastName);
    setLoading(false);

    if (result.success) {
      router.push("/account");
    } else {
      setError(result.error || "Registration failed.");
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-image">
        <Image
          src="/placeholders/auth-2.svg"
          alt=""
          fill
          style={{ objectFit: "cover" }}
        />
        <div className="auth-image-overlay">
          <p className="hero-eyebrow">Opulence</p>
          <h2>JOIN THE CLUB.</h2>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <p className="section-eyebrow">Register</p>
          <h1 className="auth-title">Create Your Account</h1>

          <form onSubmit={handleSubmit} className="form" style={{ marginTop: 32 }}>
            <div className="form-row">
              <input
                type="text"
                placeholder="First name"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last name"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password (min 5 characters)"
              required
              minLength={5}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-solid" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="muted-link">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
