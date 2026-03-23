import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReadStoredUser } from "../api";

export default function Report() {
  const navigate = useNavigate();
  const user = ReadStoredUser();
  const userKey = user
    ? `${user.user_type ?? ""}:${user.staff_id ?? ""}:${user.role ?? ""}`
    : "";

  useEffect(() => {
    const currentUser = ReadStoredUser();

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (currentUser.user_type !== "staff" || Number(currentUser.role) !== 2) {
      navigate("/", { replace: true });
    }
  }, [navigate, userKey]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Reporting
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Report Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Reporting screens are reserved for admin users and still need to be
        wired to live reporting queries.
      </p>
    </section>
  );
}
