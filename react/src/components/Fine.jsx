import PrimaryButton, { SecondaryButton } from "./Buttons";

function FormatCurrency(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

export default function Fine({ data, onPay, payPending = false }) {
  const fineAmount = Number(data.fineAmount ?? data.amount ?? 0);
  const paidAmount = Number(data.paidAmount ?? 0);
  const remainingAmount = Number(
    data.remainingAmount ?? Math.max(fineAmount - paidAmount, 0),
  );
  const fineStatus = data.fineStatus ?? data.status ?? "Unpaid";
  const fineDate = data.fineDate ?? data.assignedDate ?? data.date;
  const canPay =
    typeof onPay === "function" &&
    Boolean(data.fineId) &&
    remainingAmount > 0 &&
    fineStatus !== "Waived";

  return (
    <div className="grow basis-80 rounded-2xl border border-white/10 bg-white/5 p-5 outline-1 -outline-offset-1 outline-white/6">
      {data.title ? (
        <div>
          <h2 className="text-xl font-semibold text-white">
            {data.title}
          </h2>
          {data.creator ? (
            <p className="text-sm text-sky-300">
              {data.creator}
            </p>
          ) : null}
        </div>
      ) : (
        <h2 className="text-xl font-semibold text-white">
          Account Fine
        </h2>
      )}

      <div className="mt-4 space-y-1 text-sm text-slate-200">
        <p>
          Total Fine: {FormatCurrency(fineAmount)}
        </p>
        <p>
          Paid: {FormatCurrency(paidAmount)}
        </p>
        <p className="font-semibold text-white">
          Remaining: {FormatCurrency(remainingAmount)}
        </p>
        {fineDate ? <p>Assigned: {fineDate}</p> : null}
        {data.loanDueDate ? <p>Original Due Date: {data.loanDueDate}</p> : null}
        {data.daysOverdue !== null && data.daysOverdue !== undefined ? (
          <p>
            Days Overdue: {data.daysOverdue}
          </p>
        ) : null}
        <p>Status: {fineStatus}</p>
        {data.paidDate ? <p>Paid On: {data.paidDate}</p> : null}
        {data.waivedDate ? <p>Waived On: {data.waivedDate}</p> : null}
      </div>

      {canPay ? (
        <div className="mt-4">
          <PrimaryButton
            title={payPending ? "Processing..." : "Pay Fine"}
            disabledValue={payPending}
            onClick={() => onPay(data.fineId, remainingAmount)}
          />
        </div>
      ) : null}
    </div>
  );
}


export function FineStaff({ data }) {
  const isPaid = Boolean(data.paidStatus);
  const isWaived = Boolean(data.waiveStatus);
  const status = isWaived ? "Waived" : isPaid ? "Paid" : "Unpaid";

  return (
    <div className="text-center flex-2 basis-1/4 rounded-md bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
      {/* Fine amount */}
      <h2>
        Fine amount: {data.amount}
      </h2>
      {/* Fine established date */}
      <p>
        Assigned: {data.date}
      </p>
      {/* Fine paid/unpaid */}
      <p>
        Status:{" "}
        {status}
      </p>
      <div className="">
        <SecondaryButton
          title={
            isWaived
              ? "Mark as unwaived"
              : isPaid
                ? "Cannot mark as waived"
                : "Mark as waived"
          }
          disabled={isPaid}
        />
        <PrimaryButton
          title={isPaid ? "Mark as unpaid" : "Mark as Paid"}
        />
      </div>
    </div>
  );
}
