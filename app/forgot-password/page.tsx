"use client";

import "../auth.css";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      /*
       * Connect your password reset API here.
       *
       * Example:
       * await forgotPassword(email);
       */

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
                WELCOME
                <br />
                BACK.
              </h2>

              <div className="auth-image-line" />

              <p className="auth-image-caption">Your collection awaits.</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-brand">OPULENCE</div>

            {!submitted ? (
              <>
                <div className="auth-heading">
                  <p className="section-eyebrow">PASSWORD RESET</p>

                  <h1 className="auth-title">
                    Forgot Your
                    <br />
                    Password?
                  </h1>

                  <p className="auth-description">
                    Enter the email address associated with your account and
                    we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="form auth-form">
                  <div className="auth-field">
                    <label htmlFor="email">Email Address</label>

                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {error && <div className="error-text">{error}</div>}

                  <button
                    type="submit"
                    className="btn btn-solid auth-submit"
                    disabled={loading}
                  >
                    <span>{loading ? "SENDING..." : "SEND RESET LINK"}</span>

                    {!loading && <span className="auth-submit-arrow">→</span>}
                  </button>
                </form>

                <div className="auth-register">
                  <Link href="/login">← Back to Login</Link>
                </div>
              </>
            ) : (
              <div className="auth-success">
                <div className="auth-success-icon">✓</div>

                <p className="section-eyebrow">CHECK YOUR EMAIL</p>

                <h1 className="auth-title">
                  Reset Link
                  <br />
                  Sent.
                </h1>

                <p className="auth-description">
                  We've sent a password reset link to
                  <strong> {email}</strong>. Please check your inbox and follow
                  the instructions to create a new password.
                </p>

                <div className="auth-success-note">
                  Didn't receive the email? Check your spam or junk folder.
                </div>

                <Link
                  href="/login"
                  className="btn btn-solid auth-submit auth-back-button"
                >
                  <span>BACK TO LOGIN</span>

                  <span className="auth-submit-arrow">→</span>
                </Link>
              </div>
            )}

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
