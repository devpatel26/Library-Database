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

// Updated to use light-theme badge colors!
function GetStatusClass(status) {
  if (status === "Paid") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  if (status === "Waived") {
    return "bg-slate-100 text-slate-800 border-slate-200";
  }

  if (status === "Overdue" || status === "Fine") {
    return "bg-rose-100 text-rose-800 border-rose-200";
  }

  if (status === "Ready for pickup" || status === "Hold" || status === "Ready") {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }

  if (status === "New") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
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
        setError(
          "Account activity is currently only available for patron accounts.",
        );
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
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Account Activity
        </h2>
      </div>

      {loading ? <p className="text-slate-500 font-medium">Loading activity...</p> : null}
      {!loading && error ? <p className="text-rose-600 font-medium">{error}</p> : null}

      {!loading && !error ? (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-slate-500">No account activity found.</p>
          ) : (
            activities.map((activity) => (
              <article
                key={activity.activityId}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#244c5a]">
                      {activity.activityType}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                      {activity.headline}
                    </h3>
                    {activity.title ? (
                      <p className="mt-2 text-base font-medium text-slate-800">
                        {activity.title}
                      </p>
                    ) : null}
                    {activity.creator ? (
                      <p className="mt-1 text-sm font-medium text-[#244c5a]">
                        {activity.creator}
                      </p>
                    ) : null}
                    {activity.detail ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {activity.detail}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="text-sm font-medium text-slate-500">
                      {FormatActivityDate(activity.activityDate)}
                    </p>
                    {activity.status ? (
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${GetStatusClass(activity.status)}`}
                      >
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