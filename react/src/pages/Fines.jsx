import { useCallback, useEffect, useMemo, useState } from "react";
import { FetchJson, GetErrorMessage, ReadStoredUser } from "../api";
import { useMessage } from "../hooks/useMessage";

function FormatMoney(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function FormatDateValue(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString();
}

function NormalizeStatus(fine) {
  const rawStatus = String(fine.fineStatus ?? fine.status ?? "")
    .trim()
    .toLowerCase();

  if (rawStatus.includes("waiv")) {
    return "Waived";
  }

  if (rawStatus.includes("paid")) {
    return "Paid";
  }

  if (Number(fine.remainingAmount ?? 0) <= 0) {
    return "Paid";
  }

  return "Open";
}

export default function Fines() {
  const { showSuccess, showError, showWarning } = useMessage();

  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingFineId, setPendingFineId] = useState(null);

  const [expandedFineId, setExpandedFineId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const user = ReadStoredUser();
  const userKey = user
    ? `${user.user_type ?? ""}:${user.patron_id ?? ""}:${user.staff_id ?? ""}`
    : "";

  const LoadFines = useCallback(
    async (currentUser = ReadStoredUser()) => {
      if (!currentUser) {
        setFines([]);
        setError("Please log in first.");
        setLoading(false);
        return;
      }

      if (currentUser.user_type !== "patron") {
        setFines([]);
        setError("Fines are currently only available for patron accounts.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await FetchJson("/api/fines");
        setFines(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(GetErrorMessage(err, "Failed to load fines."));
        showError(GetErrorMessage(err, "Failed to load fines."));
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  useEffect(() => {
    LoadFines(ReadStoredUser());
  }, [userKey, LoadFines]);

  function OpenPaymentBox(fine) {
    const remainingAmount = Number(fine.remainingAmount ?? 0);
    const status = NormalizeStatus(fine);

    if (status === "Waived") {
      showWarning("This fine has been waived.");
      return;
    }

    if (remainingAmount <= 0) {
      showWarning("This fine has already been fully paid.");
      return;
    }

    setExpandedFineId(fine.fineId);
    setPaymentAmount(String(remainingAmount.toFixed(2)));
  }

  function ClosePaymentBox() {
    setExpandedFineId(null);
    setPaymentAmount("");
  }

  async function PayFine(fine) {
    const remainingAmount = Number(fine.remainingAmount ?? 0);
    const amount = Number(paymentAmount);

    if (remainingAmount <= 0) {
      showWarning("This fine has already been fully paid.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      showWarning("Please enter a valid payment amount.");
      return;
    }

    if (amount > remainingAmount) {
      showWarning(`Payment cannot exceed ${FormatMoney(remainingAmount)}.`);
      return;
    }

    try {
      setError("");
      setPendingFineId(fine.fineId);

      await FetchJson(`/api/fines/${fine.fineId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      showSuccess("Fine payment recorded successfully!");
      ClosePaymentBox();
      await LoadFines(ReadStoredUser());
    } catch (err) {
      const message = GetErrorMessage(err, "Failed to pay fine.");
      setError(message);
      showError(message);
    } finally {
      setPendingFineId(null);
    }
  }

  const openFines = useMemo(
    () =>
      fines.filter((fine) => {
        const status = NormalizeStatus(fine);
        return status !== "Paid" && status !== "Waived";
      }),
    [fines],
  );

  const outstandingBalance = useMemo(
    () =>
      openFines.reduce(
        (sum, fine) => sum + Number(fine.remainingAmount ?? 0),
        0,
      ),
    [openFines],
  );

  const totalPaid = useMemo(
    () => fines.reduce((sum, fine) => sum + Number(fine.paidAmount ?? 0), 0),
    [fines],
  );

  return (
    <section>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
        Fines
      </h1>

      {!loading && !error ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-lg font-bold text-slate-900">Open Balance</h3>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {FormatMoney(outstandingBalance)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-lg font-bold text-slate-900">Fine Records</h3>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {fines.length}
            </p>
          </div>
        </div>
      ) : null}

      {loading ? <p className="mt-6 text-slate-600 font-medium">Loading fines...</p> : null}

      {!loading && error ? <p className="mt-6 text-rose-600 font-medium">{error}</p> : null}

      {!loading && !error ? (
        <div className="mt-6 flex flex-col gap-4">
          {fines.length === 0 ? (
            <p className="text-slate-600 font-medium">No fines found.</p>
          ) : (
            fines.map((fine) => {
              const status = NormalizeStatus(fine);
              const remainingAmount = Number(fine.remainingAmount ?? 0);
              const paidAmount = Number(fine.paidAmount ?? 0);
              const fineAmount = Number(fine.amount ?? fine.fineAmount ?? 0);

              const isExpanded = expandedFineId === fine.fineId;
              const isPending = pendingFineId === fine.fineId;
              const canPay = status !== "Waived" && remainingAmount > 0;

              return (
                <div
                  key={fine.fineId}
                  className={`rounded-2xl border transition-all duration-300 p-5 ${isExpanded ? 'border-sky-300 bg-slate-50 shadow-md shadow-sky-100' : 'border-slate-200 bg-slate-50 hover:border-sky-200'}`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-slate-500">
                        Fine ID #{fine.fineId}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-900">
                        <span>Total: {FormatMoney(fineAmount)}</span>
                        <span>Paid: {FormatMoney(paidAmount)}</span>
                        <span className={remainingAmount > 0 ? "text-rose-600" : ""}>Remaining: {FormatMoney(remainingAmount)}</span>
                        <span>Status: {status}</span>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                        {fine.assignedDate ? (
                          <span>
                            Assigned: {FormatDateValue(fine.assignedDate)}
                          </span>
                        ) : null}

                        {fine.paidDate ? (
                          <span>
                            Paid date: {FormatDateValue(fine.paidDate)}
                          </span>
                        ) : null}

                        {fine.waivedDate ? (
                          <span>
                            Waived date: {FormatDateValue(fine.waivedDate)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {canPay ? (
                        <button
                          type="button"
                          onClick={() => OpenPaymentBox(fine)}
                          className="rounded-full border border-[#244c5a]/30 bg-[#244c5a]/10 px-4 py-2 text-sm font-medium text-[#244c5a] transition hover:border-[#244c5a] hover:bg-[#244c5a]/20"
                        >
                          Pay Fine
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500"
                        >
                          {status === "Waived" ? "Waived" : "Paid"}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-medium text-slate-600">
                        Enter payment amount up to{" "}
                        <span className="text-slate-900 font-bold">{FormatMoney(remainingAmount)}</span>.
                      </p>

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={paymentAmount}
                          onChange={(event) =>
                            setPaymentAmount(event.target.value)
                          }
                          placeholder="Payment amount"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all sm:max-w-xs"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => PayFine(fine)}
                            disabled={isPending}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isPending ? "Processing..." : "Confirm Payment"}
                          </button>

                          <button
                            type="button"
                            onClick={ClosePaymentBox}
                            disabled={isPending}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </section>
  );
}