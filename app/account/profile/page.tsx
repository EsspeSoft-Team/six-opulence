"use client";

import "./profile.css";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { customer, loading } = useAuth();
  const router = useRouter();

  const customerData = customer as any;

  const currentFirstName = customerData?.firstName ?? "";

  const currentLastName = customerData?.lastName ?? "";

  const email =
    customerData?.email ?? customerData?.emailAddress?.emailAddress ?? "";

  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !customer) {
      router.replace("/login");
    }
  }, [loading, customer, router]);

  useEffect(() => {
    if (customer) {
      const data = customer as any;

      setFirstName(data?.firstName ?? "");
      setLastName(data?.lastName ?? "");
    }
  }, [customer]);

  if (loading) {
    return (
      <main className="profile-loading">
        <div className="profile-loader">
          <span />
          <p>Loading your profile</p>
        </div>
      </main>
    );
  }

  if (!customer) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanFirstName = firstName.trim().replace(/\s+/g, " ");
    const cleanLastName = lastName.trim().replace(/\s+/g, " ");

    if (!cleanFirstName) {
      setError("Please enter your first name.");
      return;
    }

    if (cleanFirstName.length > 60) {
      setError("First name is too long.");
      return;
    }

    if (cleanLastName.length > 60) {
      setError("Last name is too long.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Unable to update your profile.");
      }

      setFirstName(data.customer?.firstName ?? cleanFirstName);
      setLastName(data.customer?.lastName ?? cleanLastName);

      setMessage("Profile updated successfully.");

      /*
       * Full navigation reloads the auth context, so the new
       * name is immediately reflected everywhere in the account.
       */
      setTimeout(() => {
        window.location.href = "/account";
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <div>
            <span className="profile-eyebrow">PERSONAL INFORMATION</span>

            <h1>
              Edit <em>Profile</em>
            </h1>

            <p>
              Update your name and keep your OPULENCE account details current.
            </p>
          </div>

          <Link href="/account" className="profile-back">
            <span>←</span>
            Back to Account
          </Link>
        </header>

        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <span className="profile-card-number">01</span>

              <h2>Personal Details</h2>
            </div>

            <span className="profile-card-note">EDITABLE</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="profile-fields">
              <div className="profile-field">
                <label htmlFor="firstName">FIRST NAME</label>

                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Enter first name"
                  autoComplete="given-name"
                  maxLength={60}
                  disabled={saving}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="lastName">LAST NAME</label>

                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Enter last name"
                  autoComplete="family-name"
                  maxLength={60}
                  disabled={saving}
                />
              </div>

              <div className="profile-field profile-field-full">
                <label htmlFor="email">EMAIL ADDRESS</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                />

                <span className="profile-readonly">
                  Email is managed by your account login.
                </span>
              </div>
            </div>

            {error && (
              <div className="profile-message profile-message-error">
                {error}
              </div>
            )}

            {message && (
              <div className="profile-message profile-message-success">
                {message}
              </div>
            )}

            <div className="profile-actions">
              <Link href="/account" className="profile-cancel">
                Cancel
              </Link>

              <button type="submit" className="profile-save" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
                {!saving && <span>↗</span>}
              </button>
            </div>
          </form>
        </section>

        <div className="profile-footer">
          <span />
          <p>OPULENCE ACCOUNT</p>
          <span />
        </div>
      </div>
    </main>
  );
}
