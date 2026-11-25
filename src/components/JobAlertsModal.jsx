import React, { useEffect, useState } from "react";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const SUBSCRIBERS_TABLE = "job_subscribers";

const ROLE_FOCUS_OPTIONS = [
  "All FinCrime & AML Roles",
  "AML & Transaction Monitoring",
  "KYC / CDD / EDD",
  "KYB & Onboarding",
  "Sanctions & Screening",
  "SAR / Investigations & Fraud",
];

const CADENCE_OPTIONS = [
  { value: "daily", label: "Daily morning digest" },
  { value: "weekly", label: "Weekly roundup" },
];

export default function JobAlertsModal({ isOpen, onClose, defaultState = "" }) {
  const [email, setEmail] = useState("");
  const [roleFocus, setRoleFocus] = useState(ROLE_FOCUS_OPTIONS[0]);
  const [preferredState, setPreferredState] = useState(defaultState);
  const [cadence, setCadence] = useState("daily");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPreferredState(defaultState || "");
  }, [defaultState]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !cleanedEmail.includes("@")) {
      setStatus("error");
      setMessage("Enter a valid email address so we can send matching roles.");
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
      const cleanedState = preferredState.trim();
      const statesArray =
        !cleanedState || cleanedState.toLowerCase() === "all" || cleanedState.toLowerCase() === "all india"
          ? ["ALL"]
          : [cleanedState];
      const rolesArray =
        !roleFocus || roleFocus === "All FinCrime & AML Roles"
          ? ["All Roles"]
          : [roleFocus];

      const payload = {
        email: cleanedEmail,
        states: statesArray,
        role_categories: rolesArray,
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
        setMessage(`Subscribed for ${roleFocus.toLowerCase()} updates (${cadence}).`);
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
        setMessage("This email is already subscribed to AMLDecode job alerts.");
        return;
      }

      setStatus("error");
      setMessage(errorData?.message || "Could not save your subscription right now.");
    } catch {
      setStatus("error");
      setMessage("Network error while saving subscription. Please try again.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-alerts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-emerald-400/25 bg-slate-900 p-6 text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="job-alerts-modal-title" className="mt-2 text-lg font-bold text-white">
              Get FinCrime &amp; AML Role Alerts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            &times;
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          Curated AML, KYC/CDD, KYB, Sanctions, and Financial Crime openings across India after each job sync�no spam, one-click opt-out anytime.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label htmlFor="subscriber-email" className="mb-1 block font-semibold text-emerald-300">
              Work or personal email
            </label>
            <input
              id="subscriber-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full rounded-xl border border-white/15 bg-slate-950/90 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="subscriber-role" className="mb-1 block font-semibold text-emerald-300">
                Compliance track
              </label>
              <select
                id="subscriber-role"
                value={roleFocus}
                onChange={(e) => setRoleFocus(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950/90 px-3 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
              >
                {ROLE_FOCUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subscriber-cadence" className="mb-1 block font-semibold text-emerald-300">
                Alert frequency
              </label>
              <select
                id="subscriber-cadence"
                value={cadence}
                onChange={(e) => setCadence(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950/90 px-3 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
              >
                {CADENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="subscriber-state" className="mb-1 block font-semibold text-emerald-300">
              Preferred state or hub (optional)
            </label>
            <input
              id="subscriber-state"
              type="text"
              value={preferredState}
              onChange={(e) => setPreferredState(e.target.value)}
              placeholder="e.g., Karnataka, Maharashtra, Remote"
              className="w-full rounded-xl border border-white/15 bg-slate-950/90 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-1 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {status === "submitting" ? "Saving subscription..." : "Subscribe for job update"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-3 rounded-xl border px-3 py-2 text-xs font-medium ${
              status === "error"
                ? "border-rose-400/30 bg-rose-950/60 text-rose-200"
                : "border-emerald-400/30 bg-emerald-950/60 text-emerald-200"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

