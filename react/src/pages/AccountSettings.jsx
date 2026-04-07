import { useEffect, useState } from "react";
import PrimaryButton from "../components/Buttons";
import {
  FetchJson,
  GetErrorMessage,
  ReadStoredUser,
  UpdateStoredUser,
} from "../api";

const inputClassName =
  "mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6";

export default function AccountSettings() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [contactSaving, setContactSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const user = ReadStoredUser();
  const userKey = user
    ? `${user.user_type ?? ""}:${user.patron_id ?? ""}:${user.staff_id ?? ""}`
    : "";

  useEffect(() => {
    let isMounted = true;
    const currentUser = ReadStoredUser();

    async function LoadAccountSettings() {
      if (!currentUser) {
        setError("Please log in to manage your account.");
        setLoading(false);
        return;
      }

      if (!["patron", "staff"].includes(currentUser.user_type)) {
        setError("Account settings are not available for this account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await FetchJson("/api/account");

        if (isMounted) {
          setEmail(data.email ?? "");
        }
      } catch (err) {
        if (isMounted) {
          setError(GetErrorMessage(err, "Failed to load account settings."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    LoadAccountSettings();

    return () => {
      isMounted = false;
    };
  }, [userKey]);

  async function HandleContactSubmit(event) {
    event.preventDefault();

    try {
      setContactSaving(true);
      setContactMessage("");
      setError("");
      const data = await FetchJson("/api/account/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setEmail(data.email ?? email);
      UpdateStoredUser({ email: data.email ?? email });
      setContactMessage(
        data.message ?? "Contact information updated successfully.",
      );
    } catch (err) {
      setError(GetErrorMessage(err, "Failed to update contact information."));
    } finally {
      setContactSaving(false);
    }
  }

  async function HandlePasswordSubmit(event) {
    event.preventDefault();

    try {
      setPasswordSaving(true);
      setPasswordMessage("");
      setError("");
      const data = await FetchJson("/api/account/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage(data.message ?? "Password updated successfully.");
    } catch (err) {
      setError(GetErrorMessage(err, "Failed to update password."));
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Settings
      </h2>

      {loading ? <p className="text-slate-300">Loading settings...</p> : null}
      {!loading && error ? <p className="text-rose-300">{error}</p> : null}

      {!loading && !error ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <form
            onSubmit={HandleContactSubmit}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-6"
          >
            <h2 className="text-xl font-semibold text-white">Contact Info</h2>
            <p className="mt-2 text-sm text-slate-400">
              self-service currently supports email updates.
            </p>

            <label
              htmlFor="email"
              className="mt-4 block text-sm text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />

            {contactMessage ? (
              <p className="mt-3 text-sm text-emerald-300">{contactMessage}</p>
            ) : null}

            <div className="mt-4">
              <PrimaryButton
                type="submit"
                title={contactSaving ? "Saving..." : "Save Email"}
                disabledValue={contactSaving}
              />
            </div>
          </form>

          <form
            onSubmit={HandlePasswordSubmit}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-6"
          >
            <h2 className="text-xl font-semibold text-white">Password</h2>
            <p className="mt-2 text-sm text-slate-400">
              Choose a new password with at least 8 characters.
            </p>

            <label
              htmlFor="currentPassword"
              className="mt-4 block text-sm text-slate-200"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  currentPassword: event.target.value,
                }))
              }
              className={inputClassName}
            />

            <label
              htmlFor="newPassword"
              className="mt-4 block text-sm text-slate-200"
            >
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
              className={inputClassName}
            />

            <label
              htmlFor="confirmPassword"
              className="mt-4 block text-sm text-slate-200"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              className={inputClassName}
            />

            {passwordMessage ? (
              <p className="mt-3 text-sm text-emerald-300">{passwordMessage}</p>
            ) : null}

            <div className="mt-4">
              <PrimaryButton
                type="submit"
                title={passwordSaving ? "Updating..." : "Change Password"}
                disabledValue={passwordSaving}
              />
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
