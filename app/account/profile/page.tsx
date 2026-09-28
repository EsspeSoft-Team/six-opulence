"use client";

import "./profile.css";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { customer, loading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !customer) {
      router.replace("/login");
    }
  }, [loading, customer, router]);

  useEffect(() => {
    if (!customer) return;

    const data = customer as any;

    setFirstName(data.firstName || "");

    setLastName(data.lastName || "");

    setEmail(data.email || data.emailAddress?.emailAddress || "");
  }, [customer]);

  if (loading || !customer) {
    return <main className="profile-loading">Loading...</main>;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to update profile.");
      }

      setMessage("Profile updated successfully.");

      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <span className="profile-eyebrow">MY ACCOUNT</span>

          <h1>
            Edit <em>Profile</em>
          </h1>

          <p>Update your personal account information.</p>
        </div>

        <form className="profile-card" onSubmit={handleSubmit}>
          <div className="profile-card-heading">
            <span className="profile-card-number">01</span>

            <h2>Personal Information</h2>
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <label htmlFor="firstName">First Name</label>

              <input
                id="firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="lastName">Last Name</label>

              <input
                id="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>

            <div className="profile-field profile-field-full">
              <label htmlFor="email">Email Address</label>

              <input id="email" value={email} readOnly />

              <small>Email address cannot be changed from here.</small>
            </div>
          </div>

          {message && <div className="profile-success">{message}</div>}

          {error && <div className="profile-error">{error}</div>}

          <div className="profile-actions">
            <Link href="/account" className="profile-cancel">
              Cancel
            </Link>

            <button type="submit" className="profile-save" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
