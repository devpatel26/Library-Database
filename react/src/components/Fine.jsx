import React from "react";
import PrimaryButton from "./Buttons";

export default function Fine({ amount, date, paidStatus }) {
  return (
    <div className="flex-2 basis-1/3 rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 sm:text-sm/6">
      {/* Fine amount */}
      <h2>Fine amount: {amount}</h2>
      {/* Fine established date */}
      <p>Assigned: {date}</p>
      {/* Fine paid/unpaid */}
      <p>Status: {paidStatus ? "Paid" : "Unpaid"}</p>
    </div>
  );
}
