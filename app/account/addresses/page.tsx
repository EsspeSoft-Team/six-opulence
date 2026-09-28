"use client";

import "./account.css";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Address = {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  countryCode?: string;
  zip?: string;
  phone?: string;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  zip: "",
  phone: "",
  countryCode: "IN",
  setAsDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  async function loadAddresses() {
    try {
      setLoading(true);

      const response = await fetch("/api/account/addresses", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load addresses.");
      }

      setAddresses(data.addresses || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load addresses.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function startEdit(address: Address) {
    setEditingId(address.id);

    setForm({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      address1: address.address1 || "",
      address2: address.address2 || "",
      city: address.city || "",
      province: address.province || "",
      zip: address.zip || "",
      phone: address.phone || "",
      countryCode: address.countryCode || "IN",
      setAsDefault: false,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const method = editingId ? "PATCH" : "POST";

      const body = {
        ...form,
        ...(editingId ? { id: editingId } : {}),
      };

      const response = await fetch("/api/account/addresses", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to save address.");
      }

      setMessage(editingId ? "Address updated." : "Address added.");

      resetForm();

      await loadAddresses();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to save address.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddress(id: string) {
    const confirmed = window.confirm("Delete this address?");

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/account/addresses?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to delete address.");
      }

      setMessage("Address deleted.");

      await loadAddresses();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to delete address.",
      );
    }
  }

  async function makeDefault(address: Address) {
    try {
      const response = await fetch("/api/account/addresses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: address.id,
          firstName: address.firstName || "",
          lastName: address.lastName || "",
          address1: address.address1 || "",
          address2: address.address2 || "",
          city: address.city || "",
          province: address.province || "",
          zip: address.zip || "",
          phone: address.phone || "",
          countryCode: address.countryCode || "IN",
          setAsDefault: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to set default address.");
      }

      setMessage("Default address updated.");

      await loadAddresses();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update address.",
      );
    }
  }

  return (
    <main className="addresses-page">
      <div className="addresses-container">
        <header className="addresses-header">
          <div>
            <span className="addresses-eyebrow">MY ACCOUNT</span>

            <h1>
              Saved <em>Addresses</em>
            </h1>

            <p>Manage your delivery addresses.</p>
          </div>

          <Link href="/account" className="addresses-back">
            ← Account
          </Link>
        </header>

        {(message || error) && (
          <div
            className={error ? "addresses-message error" : "addresses-message"}
          >
            {error || message}
          </div>
        )}

        <section className="address-editor">
          <div className="address-editor-heading">
            <span>{editingId ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}</span>

            <h2>{editingId ? "Update Address" : "Delivery Address"}</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="address-grid">
              <input
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                required
              />

              <input
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />

              <input
                className="full"
                placeholder="Address Line 1"
                value={form.address1}
                onChange={(e) => updateField("address1", e.target.value)}
                required
              />

              <input
                className="full"
                placeholder="Address Line 2"
                value={form.address2}
                onChange={(e) => updateField("address2", e.target.value)}
              />

              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />

              <input
                placeholder="State"
                value={form.province}
                onChange={(e) => updateField("province", e.target.value)}
              />

              <input
                placeholder="PIN Code"
                value={form.zip}
                onChange={(e) => updateField("zip", e.target.value)}
                required
              />

              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>

            <label className="default-check">
              <input
                type="checkbox"
                checked={form.setAsDefault}
                onChange={(e) => updateField("setAsDefault", e.target.checked)}
              />

              <span>Set as default address</span>
            </label>

            <div className="address-editor-actions">
              {editingId && (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}

              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Address"
                    : "Save Address"}
              </button>
            </div>
          </form>
        </section>

        <section className="saved-addresses">
          <div className="saved-addresses-heading">
            <span>YOUR ADDRESSES</span>
            <h2>Saved Addresses</h2>
          </div>

          {loading ? (
            <p>Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <div className="empty-address">No saved addresses yet.</div>
          ) : (
            <div className="address-list">
              {addresses.map((address) => (
                <article className="address-card" key={address.id}>
                  <div className="address-card-top">
                    <h3>
                      {address.firstName} {address.lastName}
                    </h3>
                  </div>

                  <p>
                    {address.address1}
                    <br />

                    {address.address2 && (
                      <>
                        {address.address2}
                        <br />
                      </>
                    )}

                    {address.city}
                    {address.province ? `, ${address.province}` : ""}
                    <br />

                    {address.zip}

                    <br />

                    {address.country || "India"}
                  </p>

                  {address.phone && <span>{address.phone}</span>}

                  <div className="address-card-actions">
                    <button type="button" onClick={() => startEdit(address)}>
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteAddress(address.id)}
                    >
                      Delete
                    </button>

                    <button type="button" onClick={() => makeDefault(address)}>
                      Set Default
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
