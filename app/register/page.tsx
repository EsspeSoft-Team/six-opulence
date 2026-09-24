"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Registration failed.");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch (err) {
      console.error("Registration error:", err);
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

        {/* RIGHT FORM */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            {/* BRAND */}
            <div className="auth-brand">OPULENCE</div>

            {/* HEADING */}
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

            {/* REGISTER FORM */}
            <form onSubmit={handleSubmit} className="form auth-form">
              {/* NAME */}
              <div className="form-row auth-name-row">
                {/* FIRST NAME */}
                <div className="auth-field">
                  <label htmlFor="firstName">First Name</label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                    value={form.firstName}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }));

                      if (error) {
                        setError("");
                      }
                    }}
                  />
                </div>

                {/* LAST NAME */}
                <div className="auth-field">
                  <label htmlFor="lastName">Last Name</label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    autoComplete="family-name"
                    required
                    value={form.lastName}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }));

                      if (error) {
                        setError("");
                      }
                    }}
                  />
                </div>
              </div>

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
                  value={form.email}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }));

                    if (error) {
                      setError("");
                    }
                  }}
                />
              </div>

              {/* PASSWORD */}
              <div className="auth-field">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password (min 5 characters)"
                  autoComplete="new-password"
                  required
                  minLength={5}
                  value={form.password}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }));

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

              {/* SUBMIT */}
              <button
                type="submit"
                className="btn btn-solid auth-submit"
                disabled={loading}
                aria-disabled={loading}
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
