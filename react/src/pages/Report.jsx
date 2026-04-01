import React from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/Buttons";

export default function Report() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-xl shadow-slate-950/30 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Admin Reports
      </p >
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Reports
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Select one of the available report options below.
      </p >

      <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <h2 className="text-xl font-semibold text-white">
            Popularity Report
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            View most popular items in the library, including different categories.
          </p >
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/popularityreport")}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <h2 className="text-xl font-semibold text-white">
            Patron Information
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Look up a patron by ID and view their holds, loans, and fines.
          </p >
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/patron-summary")}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <h2 className="text-xl font-semibold text-white">
            Overdue Report
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            View all overdue loans, the patron responsible, overdue days, and current fine totals.
          </p >
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/overduereport")}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <h2 className="text-xl font-semibold text-white">
            Fine Summary Report
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Report of total fines, paid amounts/remaining balances.
          </p >
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/fine-summary")}
            />
          </div>
        </div>
        

      </div>
    </section>
  );
}