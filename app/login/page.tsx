"use client";

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        router.push("/account");
      } else {
        setError(result.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-split">
        {/* LEFT IMAGE */}
        <div className="auth-image">
          <Image
            src="/images/b6.png"
            alt="Opulence"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 52vw"
            style={{
              objectFit: "cover",
            }}
          />

          <div className="auth-image-overlay">
            <div className="auth-image-content">
              <p className="hero-eyebrow">OPULENCE</p>

              <h2>
                WELCOME
                <br />
                BACK.
              </h2>

              <div className="auth-image-line" />

              <p className="auth-image-caption">Your collection awaits.</p>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            {/* BRAND */}
            <div className="auth-brand">OPULENCE</div>

            {/* HEADING */}
            <div className="auth-heading">
              <p className="section-eyebrow">SIGN IN</p>

              <h1 className="auth-title">
                Sign In To
                <br />
                Your Account
              </h1>

              <p className="auth-description">
                Enter your details to access your Opulence account.
              </p>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleSubmit} className="form auth-form">
              {/* EMAIL */}
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                />
              </div>

              {/* PASSWORD */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>

                  <Link href="/forgot-password" className="forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                />
              </div>

              {/* ERROR */}
              {error && (
                <div className="error-text" role="alert">
                  {error}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="btn btn-solid auth-submit"
                disabled={loading}
                aria-disabled={loading}
              >
                <span>{loading ? "LOGGING IN..." : "LOGIN"}</span>

                {!loading && <span className="auth-submit-arrow">→</span>}
              </button>
            </form>

            {/* REGISTER */}
            <div className="auth-register">
              <span>Don&apos;t have an account?</span>

              <Link href="/register">Create one</Link>
            </div>

            {/* BOTTOM DETAIL */}
            <div className="auth-bottom">
              <span>OPULENCE</span>

              <span>LIMITED EDITION MENSWEAR</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
