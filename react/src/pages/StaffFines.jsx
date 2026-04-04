import React, { useEffect, useMemo, useState, useCallback } from "react";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import { FetchJson, ReadStoredJson } from "../api";
import { FormatDate } from "../components/TimeFormats";
import { useMessage } from "../hooks/useMessage";

function GetStatusColorClass(fineStatus) {
  if (fineStatus === "Overdue") {
    return "text-red-300";
  }

  if (fineStatus === "Returned but unpaid") {
    return "text-yellow-300";
  }

  if (fineStatus === "Paid") {
    return "text-emerald-300";
  }

  if (fineStatus === "Waived") {
    return "text-sky-300";
  }

  return "text-slate-300";
}

function FormatMoney(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function SafeText(value) {
  return value == null ? "" : String(value);
}

export default function StaffFines() {
  const { showSuccess, showError, showWarning } = useMessage();

  const [fines, setFines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchBy, setSearchBy] = useState("all");
  const [searchText, setSearchText] = useState("");

  const [expandedFineId, setExpandedFineId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [payPendingFineId, setPayPendingFineId] = useState(null);
  const [waivePendingFineId, setWaivePendingFineId] = useState(null);

  const LoadFines = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await FetchJson("/api/staff/fines/current");
      setFines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showWarning(error.message || "Failed to load fines.");
    } finally {
      setIsLoading(false);
    }
  }, [showWarning]);

  useEffect(() => {
    const user = ReadStoredJson("user");

    if (!user) {
      showWarning("Please log in first.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
      return;
    }

    if (user.user_type !== "staff") {
      showError("Only staff can access the staff fines page.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
      return;
    }

    LoadFines();
  }, [showError, showWarning, LoadFines]);

  function OpenPayInput(fineId, remainingAmount) {
    if (Number(remainingAmount) <= 0) {
      showWarning("This fine has already been fully paid.");
      return;
    }

    setExpandedFineId(fineId);
    setPaymentAmount(Number(remainingAmount).toFixed(2));
  }

  function ClosePayInput() {
    setExpandedFineId(null);
    setPaymentAmount("");
  }

  async function PayFine(fineId, remainingAmount) {
    if (Number(remainingAmount) <= 0) {
      showWarning("This fine has already been fully paid.");
      return;
    }

    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      showWarning("Please enter a valid payment amount.");
      return;
    }

    if (amount > Number(remainingAmount)) {
      showWarning(`Payment cannot exceed ${FormatMoney(remainingAmount)}.`);
      return;
    }

    try {
      setPayPendingFineId(fineId);

      await FetchJson(`/api/fines/${fineId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      showSuccess("Fine payment recorded successfully!");
      ClosePayInput();
      await LoadFines();
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to pay fine.");
    } finally {
      setPayPendingFineId(null);
    }
  }

  async function WaiveFine(fineId) {
    try {
      setWaivePendingFineId(fineId);

      await FetchJson(`/api/fines/${fineId}/waive`, {
        method: "POST",
      });

      showSuccess("Fine waived successfully!");
      await LoadFines();
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to waive fine.");
    } finally {
      setWaivePendingFineId(null);
    }
  }

  const filteredFines = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    if (!normalizedSearch) {
      return fines;
    }

    return fines.filter((fine) => {
      const fields = {
        fineId: SafeText(fine.fineId),
        loanId: SafeText(fine.loanId),
        patronName: SafeText(fine.patronName),
        patronId: SafeText(fine.patronId),
        title: SafeText(fine.title),
        creator: SafeText(fine.creator),
        status: SafeText(fine.fineStatus),
      };

      if (searchBy === "all") {
        return Object.values(fields).join(" ").toLowerCase().includes(normalizedSearch);
      }

      const value = SafeText(fields[searchBy]).toLowerCase();

      if (
        searchBy === "loanId" ||
        searchBy === "patronId" ||
        searchBy === "itemId" ||
        searchBy === "fineId" ||
        searchBy === "holdId"
      ) {
        return value === normalizedSearch;
      }

      return value.includes(normalizedSearch);
    });
  }, [fines, searchBy, searchText]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Staff
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Fines
      </h1>

      <p className="mt-4 text-base leading-7 text-slate-300">
        View all fines, search by selected fields, and manage overdue, unpaid, paid, and waived balances.
      </p>

      <div className="mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
            Search By
          </label>
          <select
            value={searchBy}
            onChange={(event) => setSearchBy(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
          >
            <option value="all">
              All
            </option>
            <option value="fineId">
              Fine ID
            </option>
            <option value="loanId">
              Loan ID
            </option>
            <option value="patronName">
              Patron Name
            </option>
            <option value="patronId">
              Patron ID
            </option>
            <option value="title">
              Item Title
            </option>
            <option value="creator">
              Creator
            </option>
            <option value="status">
              Status
            </option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
            Search Text
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Enter search text..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="text-slate-300">
            Loading fines...
          </div>
        ) : filteredFines.length === 0 ? (
          <div className="text-slate-300">
            No matching fines found.
          </div>
        ) : (
          <div className="mt-6 w-full overflow-x-auto">
            <table className="w-full table-auto text-left text-sm">
              <thead>
                <tr className="bg-slate-800 text-left text-sm text-slate-200">
                  <th className="px-4 py-3">
                    Fine ID
                  </th>
                  <th className="px-4 py-3">
                    Title
                  </th>
                  <th className="px-4 py-3">
                    Patron
                  </th>
                  <th className="px-4 py-3">
                    Due Date
                  </th>
                  <th className="px-4 py-3">
                    Days Overdue
                  </th>
                  <th className="px-4 py-3">
                    Daily Fine
                  </th>
                  <th className="px-4 py-3">
                    Total Fine
                  </th>
                  <th className="px-4 py-3">
                    Paid
                  </th>
                  <th className="px-4 py-3">
                    Remaining
                  </th>
                  <th className="px-4 py-3">
                    Status
                  </th>
                  <th className="px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredFines.map((fine) => {
                  const isPaid = fine.fineStatus === "Paid";
                  const isWaived = fine.fineStatus === "Waived";
                  const isExpanded = expandedFineId === fine.fineId;
                  const isPayPending = payPendingFineId === fine.fineId;
                  const isWaivePending = waivePendingFineId === fine.fineId;

                  return (
                    <React.Fragment key={fine.fineId}>
                      <tr className="border-t border-white/10 bg-slate-950/30 text-slate-300">
                        <td className="px-4 py-3">{fine.fineId}</td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{fine.title}</div>
                          {fine.creator ? (
                            <div className="text-sm text-sky-300">{fine.creator}</div>
                          ) : null}
                        </td>

                        <td className="px-4 py-3">
                          {fine.patronName} ({fine.patronId})
                        </td>

                        <td className="px-4 py-3">
                          {fine.loanDueDate ? FormatDate(new Date(fine.loanDueDate), true) : "-"}
                        </td>

                        <td className="px-4 py-3">{fine.daysOverdue}</td>

                        <td className="px-4 py-3">{FormatMoney(fine.dailyFine)}</td>

                        <td className="px-4 py-3 text-red-300">
                          {FormatMoney(fine.fineAmount)}
                        </td>

                        <td className="px-4 py-3">{FormatMoney(fine.paidAmount)}</td>

                        <td className="px-4 py-3 font-semibold">
                          {FormatMoney(fine.remainingAmount)}
                        </td>

                        <td
                          className={`px-4 py-3 font-semibold ${GetStatusColorClass(
                            fine.fineStatus
                          )}`}
                        >
                          {fine.fineStatus}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <PrimaryButton
                              title="Pay Fine"
                              disabledValue={isPaid || isWaived || isPayPending}
                              onClick={() =>
                                OpenPayInput(fine.fineId, fine.remainingAmount)
                              }
                            />

                            <SecondaryButton
                              title="Waive Fine"
                              disabled={isPaid || isWaived || isWaivePending}
                              onClick={() => WaiveFine(fine.fineId)}
                            />
                          </div>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr className="border-t border-white/10 bg-slate-900/60">
                          <td colSpan={11} className="px-4 py-4">
                            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                              <div className="text-sm text-slate-300">
                                Enter payment amount up to {FormatMoney(fine.remainingAmount)}.
                              </div>

                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={paymentAmount}
                                  onChange={(event) => setPaymentAmount(event.target.value)}
                                  placeholder="Payment amount"
                                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-sky-400 sm:max-w-xs"
                                />

                                <div className="flex gap-2">
                                  <PrimaryButton
                                    title={isPayPending ? "Processing..." : "Confirm Payment"}
                                    disabledValue={isPayPending}
                                    onClick={() =>
                                      PayFine(fine.fineId, fine.remainingAmount)
                                    }
                                  />

                                  <SecondaryButton
                                    title="Cancel"
                                    disabled={isPayPending}
                                    onClick={ClosePayInput}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}