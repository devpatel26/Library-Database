import React from "react";
import PrimaryButton, { SecondaryButton } from "./Buttons";

export default function Fine({ amount, date, paidStatus, waiveStatus }) {
  return (
    <div className="text-center flex-2 basis-1/4 rounded-md bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
      {/* Fine amount */}
      <h2>Fine amount: {amount}</h2>
      {/* Fine established date */}
      <p>Assigned: {date}</p>
      {/* Fine paid/unpaid */}
      <p>Status: {paidStatus ? (waiveStatus ? "Waived" : "Unpaid") : "Paid"}</p>
    </div>
  );
}

export function StaffFine({ amount, date, paidStatus, waiveStatus }) {
  return (
    <div className="text-center flex-2 basis-1/4 rounded-md bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
      {/* Fine amount */}
      <h2>Fine amount: {amount}</h2>
      {/* Fine established date */}
      <p>Assigned: {date}</p>
      {/* Fine paid/unpaid */}
      <p>Status: {paidStatus ? (waiveStatus ? "Waived" : "Unpaid") : "Paid"}</p>
      <div className="">
        <SecondaryButton
          title={
            waiveStatus
              ? paidStatus
                ? "Mark as waived"
                : "Cannot mark as waived"
              : "Mark as unwaived"
          }
        />
        <PrimaryButton title={paidStatus ? "Mark as Paid" : "Mark as unpaid"} />
      </div>
    </div>
  );
}
