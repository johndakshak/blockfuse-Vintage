'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { updateUser, deleteUser, AuthError } from "@/app/lib/auth";

const inputClass = "w-full bg-[#f4f2ee] border border-charcoal/[0.09] rounded-lg px-3.5 py-2.5 font-barlow text-[0.83rem] text-charcoal outline-none focus:border-accent transition-colors";
const labelClass = "block text-[0.65rem] tracking-[0.18em] uppercase text-warmgray mb-1.5";

type Toggle = { label: string; on: boolean };

const INITIAL_TOGGLES: Toggle[] = [
  { label: "New order alerts",         on: true  },
  { label: "Low stock warnings",       on: true  },
  { label: "Customer registrations",   on: false },
  { label: "Weekly sales report",      on: true  },
];

export default function SettingsSection() {
  const { user, token, clearAuth, updateUser: syncUser } = useAuth();
  const router = useRouter();

  const [toggles, setToggles] = useState<Toggle[]>(INITIAL_TOGGLES);

  // ── Profile update state ───────────────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Delete account state ───────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function flip(i: number) {
    setToggles((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, on: !t.on } : t))
    );
  }

  // ── Save profile changes (name and/or email) ───────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !token) return;

    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      const response = await updateUser(user.id, { name: name.trim(), email: email.trim() }, token);

      // Keep AuthContext (and the Navbar greeting) in sync with the new values
      syncUser({ name: response.data.name, email: response.data.email });

      setSaveSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      if (err instanceof AuthError) {
        // JWT expired or rejected — clear session and redirect to login
        clearAuth();
        router.push("/login");
      } else {
        // Network or server error — do not clear the session
        setSaveError(err instanceof Error ? err.message : "Could not save changes.");
      }
    } finally {
      setSaving(false);
    }
  }

  // ── Delete account ─────────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (!user || !token) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteUser(user.id, token);

      // Account deleted — clear all auth state and send to login
      clearAuth();
      router.push("/login");
    } catch (err) {
      if (err instanceof AuthError) {
        // Token was rejected — clear session and redirect
        clearAuth();
        router.push("/login");
      } else {
        // Network or server error — do not clear the session, show the error
        setDeleteError(err instanceof Error ? err.message : "Could not delete account. Please try again.");
        setShowDeleteConfirm(false);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal mb-6">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        {/* Profile details — connected to PATCH /users/update/:id */}
        <form onSubmit={handleSaveProfile}>
          <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal/[0.09]">
              <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Profile Details</span>
            </div>
            <div className="p-5 flex flex-col gap-4">

              {/* Success banner */}
              {saveSuccess && (
                <div
                  className="border rounded-lg px-4 py-2.5 text-[0.8rem] font-barlow"
                  style={{
                    background: "rgba(168,137,62,0.08)",
                    borderColor: "rgba(168,137,62,0.3)",
                    color: "#a8893e",
                  }}
                  role="status"
                >
                  Profile updated successfully.
                </div>
              )}

              {/* Error banner */}
              {saveError && (
                <div
                  className="border rounded-lg px-4 py-2.5 text-[0.8rem] font-barlow"
                  style={{
                    background: "rgba(176,92,58,0.08)",
                    borderColor: "rgba(176,92,58,0.3)",
                    color: "#b05c3a",
                  }}
                  role="alert"
                >
                  {saveError}
                </div>
              )}

              <div>
                <label className={labelClass} htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  className={inputClass}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Role — read-only, not editable via the API */}
              <div>
                <label className={labelClass}>Role</label>
                <div className={`${inputClass} text-warmgray cursor-default`}>
                  {user?.role ?? "—"}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="self-start font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg bg-charcoal text-cream hover:bg-[#2c2c2a] transition-colors cursor-pointer border-none mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          {/* Notifications */}
          <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal/[0.09]">
              <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Notifications</span>
            </div>
            <div className="px-5 py-2">
              {toggles.map((t, i) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between py-3 border-b border-charcoal/[0.05] last:border-0"
                >
                  <span className="text-[0.83rem] text-charcoal">{t.label}</span>
                  <button
                    type="button"
                    onClick={() => flip(i)}
                    className={`relative w-[38px] h-5 rounded-full transition-colors duration-200 flex-shrink-0 border-none cursor-pointer ${
                      t.on ? "bg-accent" : "bg-charcoal/15"
                    }`}
                    aria-label={`Toggle ${t.label}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                        t.on ? "left-[20px]" : "left-[2px]"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal/[0.09]">
              <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Security</span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {["Change Password", "Two-Factor Authentication"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="w-full text-left px-4 py-2.5 rounded-lg border border-charcoal/[0.09] font-barlow text-[0.72rem] tracking-[0.12em] uppercase font-medium text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent"
                >
                  {label}
                </button>
              ))}

              {/* Delete account error */}
              {deleteError && (
                <div
                  className="border rounded-lg px-4 py-2.5 text-[0.8rem] font-barlow mt-1"
                  style={{
                    background: "rgba(176,92,58,0.08)",
                    borderColor: "rgba(176,92,58,0.3)",
                    color: "#b05c3a",
                  }}
                  role="alert"
                >
                  {deleteError}
                </div>
              )}

              {/* Delete Account — requires confirmation before the request is made */}
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => { setDeleteError(""); setShowDeleteConfirm(true); }}
                  className="w-full text-left px-4 py-2.5 rounded-lg font-barlow text-[0.72rem] tracking-[0.12em] uppercase font-medium cursor-pointer border transition-all"
                  style={{ background: "rgba(176,92,58,0.07)", color: "#b05c3a", borderColor: "rgba(176,92,58,0.18)" }}
                >
                  Delete Account
                </button>
              ) : (
                <div
                  className="border rounded-xl p-4 flex flex-col gap-3"
                  style={{ background: "rgba(176,92,58,0.06)", borderColor: "rgba(176,92,58,0.2)" }}
                >
                  <p className="text-[0.8rem] font-barlow text-charcoal leading-relaxed">
                    This will permanently delete your account. This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex-1 px-3 py-2 rounded-lg font-barlow text-[0.72rem] tracking-[0.12em] uppercase font-medium cursor-pointer border-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: "#b05c3a", color: "#fff" }}
                    >
                      {deleting ? "Deleting…" : "Yes, Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="flex-1 px-3 py-2 rounded-lg font-barlow text-[0.72rem] tracking-[0.12em] uppercase font-medium cursor-pointer border border-charcoal/20 bg-transparent text-charcoal hover:border-charcoal/50 transition-colors disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
