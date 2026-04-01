import { useCallback, useEffect, useMemo, useState } from "react";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import { FetchJson, ReadStoredUser } from "../api";
import { FormatDate } from "../components/TimeFormats";
import { useMessage } from "../hooks/useMessage";

async function FetchLostLoans() {
  return FetchJson("/api/loans/lost");
}

function SafeText(value) {
  return value == null ? "" : String(value);
}

export default function Lost() {

  const { showSuccess, showError, showWarning } = useMessage();

  const [lostLoans, setLostLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchBy, setSearchBy] = useState("all");
  const [searchText, setSearchText] = useState("");

  const LoadLost = useCallback(async () => {

    try {

      setIsLoading(true);

      const data = await FetchLostLoans();

      setLostLoans(data);

    } catch (error) {

      console.error(error);
      showError("Failed to load lost items.");

    } finally {

      setIsLoading(false);

    }
  }, [showError]);

  useEffect(() => {

    const user = ReadStoredUser();

    if (!user) {
      showWarning("Please login first.");
      window.location.href = "/login";
      return;
    }

    if (user.user_type !== "staff") {
      showWarning("Only staff can access lost items.");
      window.location.href = "/";
      return;
    }

    LoadLost();

  }, [LoadLost, showWarning]);

  async function MarkFound(loanId) {

    try {

      await FetchJson(`/api/loans/${loanId}/found`, {
        method: "POST"
      });

      showSuccess("Item marked as found.");

      LoadLost();

    } catch  {

      showError("Failed to update item.");

    }

  }

  async function PermanentlyDelete(loanId) {

    try {

      await FetchJson(`/api/loans/${loanId}/delete-lost`, {
        method: "POST"
      });

      showSuccess("Item permanently removed.");

      LoadLost();

    } catch  {

      showError("Delete failed.");

    }

  }

  const filteredLost = useMemo(() => {

    const text = searchText.trim().toLowerCase();

    if (!text) return lostLoans;

    return lostLoans.filter((loan) => {

      const fields = {

        loanId: SafeText(loan.loanId),
        patronName: SafeText(loan.patronName),
        patronId: SafeText(loan.patronId),
        itemId: SafeText(loan.itemId),
        title: SafeText(loan.title),
        creator: SafeText(loan.creator)

      };

      if (searchBy === "all") {
        return Object.values(fields).join(" ").toLowerCase().includes(text);
      }

      const value = fields[searchBy]?.toLowerCase() ?? "";

      if (["loanId","patronId","itemId"].includes(searchBy)) {
        return value === text;
      }

      return value.includes(text);

    });

  }, [lostLoans, searchText, searchBy]);

  return (

<section className="mx-auto flex w-full max-w-6xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">

<p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
Staff
</p>

<h1 className="mt-3 text-4xl font-semibold text-white">
Lost Items
</h1>

<div className="mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">

<div>
<label className="text-xs text-sky-300 uppercase">Search By</label>

<select
value={searchBy}
onChange={(e)=>setSearchBy(e.target.value)}
className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
>

<option value="all">All</option>
<option value="loanId">Loan ID</option>
<option value="patronName">Patron Name</option>
<option value="patronId">Patron ID</option>
<option value="itemId">Item ID</option>
<option value="title">Item Title</option>
<option value="creator">Creator</option>

</select>
</div>

<div>
<label className="text-xs text-sky-300 uppercase">Search Text</label>

<input
type="text"
value={searchText}
onChange={(e)=>setSearchText(e.target.value)}
className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
/>
</div>

</div>

<div className="mt-6 space-y-4">

{isLoading ? (

<div className="text-slate-300">Loading lost items...</div>

) : filteredLost.length === 0 ? (

<div className="text-slate-300">No lost items.</div>

) : (

filteredLost.map((loan)=>(
<div
key={loan.loanId}
className="grid grid-cols-1 gap-4 rounded-xl bg-white/5 p-4 outline outline-1 outline-white/10 lg:grid-cols-4"
>

<div className="lg:col-span-3">

<div className="text-xl font-bold text-white">
{loan.title}
</div>

<div className="text-slate-400">
Loan ID: {loan.loanId}
</div>

<div className="text-slate-400">
Item ID: {loan.itemId}
</div>

<div className="text-slate-300 mt-2">
Patron: {loan.patronName} ({loan.patronId})
</div>

<div className="text-slate-400">
Lost Date: {loan.returnDate ? FormatDate(new Date(loan.returnDate), true) : "-"}
</div>

</div>

<div className="flex flex-col gap-2 items-end">

<PrimaryButton
title="Found"
onClick={()=>MarkFound(loan.loanId)}
/>

<SecondaryButton
title="Permanent Delete"
onClick={()=>PermanentlyDelete(loan.loanId)}
/>

</div>

</div>
))

)}

</div>

</section>

  );
}