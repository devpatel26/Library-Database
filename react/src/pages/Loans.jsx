import { useState, useEffect } from "react";
import { dummyItemLoans, dummyItemHolds } from "../data/dummy/items";

import { ItemHold, ItemLoan } from "../components/Items";

export default function Loans() {
  const [loans, setLoans] = useState(null);

  useEffect(() => {
    fetch("/api/loans", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setLoans(data));
  }, []);

  /*
  if (!loans) {
    return <div>No Loans</div>;
  }
  */

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Loans
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Loans Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Patron loan details will appear here.
      </p>

      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          Tests for account view loan (patron)
        </p>
        {dummyItemLoans.map((item, index) => (
          <ItemLoan key={index} itemData={item} />
        ))}
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          Tests for account view hold (patron)
        </p>
        {dummyItemHolds.map((item, index) => (
          <ItemHold key={index} itemData={item} />
        ))}
      </div>
    </section>
  );
}
