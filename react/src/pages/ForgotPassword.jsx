import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SubmitButton } from "../components/Buttons";
import { FetchJson, GetErrorMessage } from "../api";

function FormatExpiresAt(expiresAt) {
  if (!expiresAt) {
    return "";
  }

  const parsedDate = new Date(expiresAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(expiresAt);
  }

  return parsedDate.toLocaleString();
}

export default function ForgotPassword() {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = String(searchParams.get("token") ?? "").trim();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewLink, setPreviewLink] = useState("");
  const [previewExpiresAt, setPreviewExpiresAt] = useState("");

  async function HandleRequestReset(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");
      setPreviewLink("");
      setPreviewExpiresAt("");

      const data = await FetchJson("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
        }),
      });

      setMessage(data?.message ?? "Password reset request submitted.");
      setPreviewLink(data?.resetUrl ?? "");
      setPreviewExpiresAt(data?.expiresAt ?? "");
    } catch (caughtError) {
      setError(GetErrorMessage(caughtError, "Failed to start password reset."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function HandleResetPassword(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");

      const data = await FetchJson("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: formData.get("newPassword"),
          confirmPassword: formData.get("confirmPassword"),
        }),
      });

      setSearchParams({}, { replace: true });
      setMessage(data?.message ?? "Password reset successful.");
      setPreviewLink("");
      setPreviewExpiresAt("");
      event.currentTarget.reset();
    } catch (caughtError) {
      setError(GetErrorMessage(caughtError, "Failed to reset password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center shadow-xl shadow-slate-950/30 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Account Recovery
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        {token ? "Reset Password" : "Forgot Password"}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        {token
          ? "Enter your new password below to finish the reset."
          : "Enter the email address for your account to generate a reset link."}
      </p>

      {message && (
        <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {token ? (
        <form
          className="flex w-full flex-col items-center"
          onSubmit={HandleResetPassword}
        >
          <label
            htmlFor="new-password"
            className="mt-6 w-full max-w-md text-left text-sm font-medium text-slate-200"
          >
            New Password
          </label>
          <input
            required
            minLength={8}
            id="new-password"
            name="newPassword"
            type="password"
            className="mt-2 block w-full max-w-md rounded-md bg-white/5 px-3 py-2 text-slate-100 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
          />

          <label
            htmlFor="confirm-password"
            className="mt-6 w-full max-w-md text-left text-sm font-medium text-slate-200"
          >
            Confirm Password
          </label>
          <input
            required
            minLength={8}
            id="confirm-password"
            name="confirmPassword"
            type="password"
            className="mt-2 block w-full max-w-md rounded-md bg-white/5 px-3 py-2 text-slate-100 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
          />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <SubmitButton
              title={isSubmitting ? "Resetting..." : "Reset Password"}
              disabledValue={isSubmitting}
            />
          </div>
        </form>
      ) : (
        <form
          className="flex w-full flex-col items-center"
          onSubmit={HandleRequestReset}
        >
          <label
            htmlFor="recovery-email"
            className="mt-6 w-full max-w-md text-left text-sm font-medium text-slate-200"
          >
            Email
          </label>
          <input
            required
            id="recovery-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className="mt-2 block w-full max-w-md rounded-md bg-white/5 px-3 py-2 text-slate-100 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
          />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <SubmitButton
              title={isSubmitting ? "Generating..." : "Send Reset Link"}
              disabledValue={isSubmitting}
            />
          </div>
        </form>
      )}

      {!token && previewLink && (
        <div className="mt-8 w-full rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-left text-sm text-slate-200">
          <p className="font-semibold text-sky-200">
            Development reset link preview
          </p>
          <a
            href={previewLink}
            className="mt-3 block break-all text-sky-300 underline decoration-sky-400/60 underline-offset-2 hover:text-sky-200"
          >
            {previewLink}
          </a>
          {previewExpiresAt && (
            <p className="mt-3 text-slate-300">
              Expires: {FormatExpiresAt(previewExpiresAt)}
            </p>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-slate-400">
        Remembered your password?{" "}
        <Link to="/login" className="text-sky-300 hover:text-sky-200">
          Return to login
        </Link>
      </p>
    </section>
  );
}
