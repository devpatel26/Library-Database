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

  // Standardized classes for high-visibility light theme
  const inputClasses =
    "mt-2 block w-full max-w-md rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400";

  const labelClasses =
    "mt-6 w-full max-w-md text-left text-sm font-bold text-slate-700 uppercase tracking-wide";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email") }),
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
        headers: { "Content-Type": "application/json" },
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
    <section className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-700">
        Account Recovery
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        {token ? "Reset Password" : "Forgot Password"}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
        {token
          ? "Enter your new password below to finish the reset process."
          : "Enter your email address and we'll send you a link to get back into your account."}
      </p>

      {message && (
        <div className="mt-6 w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 w-full max-w-md rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {token ? (
        <form
          className="flex w-full flex-col items-center"
          onSubmit={HandleResetPassword}
        >
          <label htmlFor="new-password" className={labelClasses}>
            New Password
          </label>
          <input
            required
            minLength={8}
            id="new-password"
            name="newPassword"
            type="password"
            placeholder="Min. 8 characters"
            className={inputClasses}
          />

          <label htmlFor="confirm-password" className={labelClasses}>
            Confirm Password
          </label>
          <input
            required
            minLength={8}
            id="confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            className={inputClasses}
          />

          <div className="mt-8">
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
          <label htmlFor="recovery-email" className={labelClasses}>
            Email Address
          </label>
          <input
            required
            id="recovery-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className={inputClasses}
          />
          <div className="mt-8">
            <SubmitButton
              title={isSubmitting ? "Generating..." : "Send Reset Link"}
              disabledValue={isSubmitting}
            />
          </div>
        </form>
      )}

      {!token && previewLink && (
        <div className="mt-8 w-full max-w-md rounded-2xl border border-sky-200 bg-sky-50 p-6 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
            Development Preview
          </p>
          <a
            href={previewLink}
            className="mt-2 block break-all text-sm font-medium text-sky-700 underline hover:text-sky-800"
          >
            {previewLink}
          </a>
          {previewExpiresAt && (
            <p className="mt-2 text-xs text-slate-500 italic">
              Expires: {FormatExpiresAt(previewExpiresAt)}
            </p>
          )}
        </div>
      )}

      <div className="mt-10">
        <Link
          to="/login"
          className="text-sm font-bold text-sky-700 hover:text-sky-700 transition-colors"
        >
          Return to login
        </Link>
      </div>
    </section>
  );
}
