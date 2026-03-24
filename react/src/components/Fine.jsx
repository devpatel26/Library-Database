import PrimaryButton, { SecondaryButton } from "./Buttons";

export default function Fine({ data }) {
  return (
    <div className="text-center flex-2 basis-1/4 rounded-md bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
      <h2>
        Fine amount: ${Number(data.amount).toFixed(2)}
      </h2>
      <p>
        Assigned: {data.assignedDate}
      </p>
      <p>
        Status: {data.status}
      </p>
      {data.paidDate && <p>Paid: {data.paidDate}</p>}
      {data.waivedDate && <p>Waived: {data.waivedDate}</p>}
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
