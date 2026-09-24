"use client";

import { useState } from "react";

import Link from "next/link";

import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start login.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Login error:", error);

      setError("Unable to continue login. Please try again.");

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
                Enter your email to access your Opulence account.
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

              {/* ERROR */}

              {error && (
                <div className="error-text" role="alert">
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="btn btn-solid auth-submit"
                disabled={loading}
                aria-disabled={loading}
              >
                <span>{loading ? "CONTINUING..." : "LOGIN"}</span>

                {!loading && <span className="auth-submit-arrow">→</span>}
              </button>
            </form>

            {/* REGISTER INFO */}

            <div className="auth-register">
              <span>New to Opulence?</span>

              <span>Continue with your email</span>
            </div>

            {/* BOTTOM */}

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
