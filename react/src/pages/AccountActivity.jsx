import { useEffect, useState } from "react";
import { FetchJson, GetErrorMessage, ReadStoredUser } from "../api";

function FormatActivityDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(parsedDate);
}

function GetStatusClass(status) {
  if (status === "Paid") {
    return "bg-emerald-400/10 text-emerald-300";
  }

  if (status === "Waived") {
    return "bg-sky-400/10 text-sky-300";
  }

  if (status === "Overdue") {
    return "bg-rose-400/10 text-rose-300";
  }

  if (status === "Ready") {
    return "bg-amber-400/10 text-amber-300";
  }

  return "bg-white/10 text-slate-200";
}

export default function AccountActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = ReadStoredUser();
  const userKey = user
    ? `${user.user_type ?? ""}:${user.patron_id ?? ""}:${user.staff_id ?? ""}`
    : "";

  useEffect(() => {
    const currentUser = ReadStoredUser();

    async function LoadActivity() {
      if (!currentUser) {
        setActivities([]);
        setError("Please log in to view account activity.");
        setLoading(false);
        return;
      }

      if (currentUser.user_type !== "patron") {
        setActivities([]);
        setError("Account activity is currently only available for patron accounts.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await FetchJson("/api/account/activity");
        setActivities(data ?? []);
      } catch (err) {
        setError(GetErrorMessage(err, "Failed to load account activity."));
      } finally {
        setLoading(false);
      }
    }

    LoadActivity();
  }, [userKey]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          Activity
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Account Activity
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Review recent holds, checkouts, and fine events tied to your account.
        </p>
      </div>

      {loading ? <p className="text-slate-300">Loading activity...</p> : null}
      {!loading && error ? <p className="text-rose-300">{error}</p> : null}

      {!loading && !error ? (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-slate-300">
              No account activity found.
            </p>
          ) : (
            activities.map((activity) => (
              <article
                key={activity.activityId}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
                      {activity.activityType}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-white">
                      {activity.headline}
                    </h2>
                    {activity.title ? (
                      <p className="mt-3 text-base text-slate-100">{activity.title}</p>
                    ) : null}
                    {activity.creator ? (
                      <p className="text-sm text-sky-300">{activity.creator}</p>
                    ) : null}
                    {activity.detail ? (
                      <p className="mt-2 text-sm text-slate-300">{activity.detail}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="text-sm text-slate-300">
                      {FormatActivityDate(activity.activityDate)}
                    </p>
                    {activity.status ? (
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${GetStatusClass(activity.status)}`}>
                        {activity.status}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
