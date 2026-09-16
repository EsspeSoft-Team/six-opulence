"use client";

import "../auth.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await register(
        form.email,
        form.password,
        form.firstName,
        form.lastName,
      );

      if (result.success) {
        router.push("/account");
      } else {
        setError(result.error || "Registration failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      const result = await loginWithGoogle();

      if (result.success) {
        router.push("/account");
      } else {
        setError(result.error || "Google registration failed.");
      }
    } catch {
      setError("Unable to continue with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-split">
        {/* IMAGE */}
        <div className="auth-image">
          <Image
            src="/images/b6.png"
            alt="Opulence"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 52vw"
            style={{ objectFit: "cover" }}
          />

          <div className="auth-image-overlay">
            <div className="auth-image-content">
              <p className="hero-eyebrow">OPULENCE</p>

              <h2>
                JOIN
                <br />
                THE CLUB.
              </h2>

              <div className="auth-image-line" />

              <p className="auth-image-caption">
                A world of limited edition menswear.
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-brand">OPULENCE</div>

            <div className="auth-heading">
              <p className="section-eyebrow">CREATE ACCOUNT</p>

              <h1 className="auth-title">
                Create Your
                <br />
                Account
              </h1>

              <p className="auth-description">
                Join Opulence and discover our limited edition collection.
              </p>
            </div>

            {/* GOOGLE */}
            <button
              type="button"
              className="google-auth-button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              <span className="google-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.9c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.9Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.53 13.99A5.86 5.86 0 0 1 6.22 12c0-.69.12-1.36.31-1.99V7.48H3.28A9.73 9.73 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.52l3.25-2.53Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.98c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.02 14.63 2.1 12 2.1a9.74 9.74 0 0 0-8.72 5.38l3.25 2.53C7.3 7.7 9.46 5.98 12 5.98Z"
                  />
                </svg>
              </span>

              <span>
                {googleLoading ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
              </span>
            </button>

            {/* DIVIDER */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* REGISTER FORM */}
            <form onSubmit={handleSubmit} className="form auth-form">
              <div className="form-row auth-name-row">
                <div className="auth-field">
                  <label htmlFor="firstName">First Name</label>

                  <input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="lastName">Last Name</label>

                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    autoComplete="family-name"
                    required
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  type="password"
                  placeholder="Password (min 5 characters)"
                  autoComplete="new-password"
                  required
                  minLength={5}
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              {error && <div className="error-text">{error}</div>}

              <button
                type="submit"
                className="btn btn-solid auth-submit"
                disabled={loading || googleLoading}
              >
                <span>
                  {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                </span>

                {!loading && <span className="auth-submit-arrow">→</span>}
              </button>
            </form>

            {/* LOGIN */}
            <div className="auth-register">
              <span>Already have an account?</span>

              <Link href="/login">Login</Link>
            </div>

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
