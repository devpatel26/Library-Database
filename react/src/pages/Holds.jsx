import { useEffect, useState } from "react";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import { FetchJson, ReadStoredUser } from "../api";
import { FormatTime, FormatDate } from "../components/TimeFormats";

async function FetchCurrentHolds() {
  return FetchJson("/api/holds/current");
}

export default function Holds() {
  const user = ReadStoredUser();
  const [holds, setHolds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = ReadStoredUser();

    async function LoadHolds() {
      try {
        setIsLoading(true);
        setHolds(await FetchCurrentHolds());
      } catch (error) {
        console.error(error);
        alert(error.message || "Failed to load holds.");
      } finally {
        setIsLoading(false);
      }
    }

    if (!currentUser) {
      alert("Please log in first.");
      window.location.href = "/login";
      return;
    }

    if (currentUser.user_type !== "staff") {
      alert("Only staff can access the holds page.");
      window.location.href = "/";
      return;
    }

    LoadHolds();
  }, [user?.staff_id, user?.user_type]);

  async function CancelHold(holdId) {
    try {
      await FetchJson(`/api/holds/${holdId}`, {
        method: "DELETE",
      });

      alert("Hold cancelled successfully!");
      setIsLoading(true);
      setHolds(await FetchCurrentHolds());
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to cancel hold.");
    } finally {
      setIsLoading(false);
    }
  }

  async function CheckoutHold(holdId) {
    try {
      await FetchJson(`/api/holds/${holdId}/checkout`, {
        method: "POST",
      });

      alert("Hold checked out successfully!");
      setIsLoading(true);
      setHolds(await FetchCurrentHolds());
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to check out hold.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Staff
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Current Holds
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-300">
        View all active holds, cancel them, or convert them into loans.
      </p>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="text-slate-300">Loading holds...</div>
        ) : holds.length === 0 ? (
          <div className="text-slate-300">No current holds found.</div>
        ) : (
          holds.map((hold) => (
            <div
              key={hold.holdId}
              className="grid grid-cols-1 gap-4 rounded-xl bg-white/5 p-4 outline outline-1 outline-white/10 md:grid-cols-4"
            >
              <div className="md:col-span-2">
                <div className="text-xl font-bold text-white">{hold.title}</div>
                {hold.creator ? (
                  <div className="text-sky-300">{hold.creator}</div>
                ) : null}
                <div className="mt-2 text-slate-300">
                  Held by: {hold.patronName} (Patron ID: {hold.patronId})
                </div>
                <div className="text-slate-400">
                  Hold date: {FormatDate(new Date(hold.holdStart), true)}
                </div>
                <div className="text-slate-400">
                  Expires: {FormatDate(new Date(hold.holdEnd), true)}
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-center gap-3">
                <SecondaryButton
                  title="Cancel Hold"
                  onClick={() => CancelHold(hold.holdId)}
                />
                <PrimaryButton
                  title="Check Out"
                  onClick={() => CheckoutHold(hold.holdId)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
