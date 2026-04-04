import { useEffect } from "react";
import { ClearStoredAuth } from "../api";
import { useMessage } from "../hooks/useMessage";

export default function Logout() {
  const { showInfo } = useMessage();

  useEffect(() => {
    ClearStoredAuth();
    showInfo("You have been logged out.");

    const timeoutId = setTimeout(() => {
      window.location.href = "/login";
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [showInfo]);

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-2xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Logout
      </p >
      <h1 className="mt-3 text-3xl font-semibold text-white">Logging out...</h1>
      <p className="mt-4 text-slate-300">
        Your session has ended. Redirecting to login page.
      </p >
    </section>
  );
}