import React from "react";
import PrimaryButton, { SecondaryButton } from "./Buttons";

export default function Fine({ data }) {
  return (
    <div className="text-center flex-2 basis-1/4 rounded-md bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
      {/* Fine amount */}
      <h2>Fine amount: {data.amount}</h2>
      {/* Fine established date */}
      <p>Assigned: {data.date}</p>
      {/* Fine paid/unpaid */}
      <p>
        Status:{" "}
        {data.paidStatus ? (data.waiveStatus ? "Waived" : "Unpaid") : "Paid"}
      </p>
    </div>
  );
}

export function FineStaff({ data }) {
  return (
    <div className="text-center flex-2 basis-1/4 rounded-md bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
      {/* Fine amount */}
      <h2>Fine amount: {data.amount}</h2>
      {/* Fine established date */}
      <p>Assigned: {data.date}</p>
      {/* Fine paid/unpaid */}
      <p>
        Status:{" "}
        {data.paidStatus ? (data.waiveStatus ? "Waived" : "Unpaid") : "Paid"}
      </p>
      <div className="">
        <SecondaryButton
          title={
            data.waiveStatus
              ? data.paidStatus
                ? "Mark as waived"
                : "Cannot mark as waived"
              : "Mark as unwaived"
          }
        />
        <PrimaryButton
          title={data.paidStatus ? "Mark as Paid" : "Mark as unpaid"}
        />
      </div>
    </div>
  );
}
