import React, { useState } from "react";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Change "job_subscribers" if your Supabase subscriber table uses a different name
const SUBSCRIBERS_TABLE = "job_subscribers";

export default function JobAlertsModal({ isOpen, onClose, defaultState = "" }) {
  const [email, setEmail] = useState("");
  const [preferredState, setPreferredState] = useState(defaultState);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !cleanedEmail.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setStatus("error");
      setMessage("Supabase frontend configuration is missing.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const payload = {
        email: cleanedEmail,
        ...(preferredState ? { preferred_state: preferredState } : {}),
        source: "jobs_page_modal",
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUBSCRIBERS_TABLE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("You are subscribed to daily compliance job alerts.");
        setEmail("");
        return;
      }

      const errorData = await res.json().catch(() => ({}));
      const isDuplicate =
        res.status === 409 ||
        errorData?.code === "23505" ||
        String(errorData?.message || "").toLowerCase().includes("duplicate");

      if (isDuplicate) {
        setStatus("exists");
        setMessage("This email is already subscribed to daily job alerts.");
        return;
      }

      setStatus("error");
      setMessage(errorData?.message || "Could not save subscription right now.");
    } catch {
      setStatus("error");
      setMessage("Network error while subscribing. Please try again.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-alerts-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 id="job-alerts-modal-title" style={{ margin: 0, fontSize: "1.125rem" }}>
            Daily FinCrime &amp; AML Job Alerts
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        <p style={{ marginTop: "8px", marginBottom: "16px", fontSize: "0.9rem", color: "#475569" }}>
          Get daily compliance updates after the morning job sync.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="subscriber-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600 }}>
            Email address
          </label>
          <input
            id="subscriber-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginTop: "6px",
              marginBottom: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.95rem",
            }}
          />

          <label htmlFor="subscriber-state" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600 }}>
            Preferred state (optional)
          </label>
          <input
            id="subscriber-state"
            type="text"
            value={preferredState}
            onChange={(e) => setPreferredState(e.target.value)}
            placeholder="e.g., Karnataka"
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginTop: "6px",
              marginBottom: "16px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.95rem",
            }}
          />

          <button
            type="submit"
            disabled={status === "submitting"}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontWeight: 600,
              cursor: status === "submitting" ? "not-allowed" : "pointer",
            }}
          >
            {status === "submitting" ? "Subscribing..." : "Subscribe to Alerts"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "12px",
              marginBottom: 0,
              fontSize: "0.875rem",
              fontWeight: 500,
              color: status === "error" ? "#b91c1c" : "#15803d",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
