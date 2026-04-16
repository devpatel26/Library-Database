import React from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/Buttons";

export default function Report() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-lg sm:p-10">
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
        Reports
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Reports are available below.
      </p>

      <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left">
          <h2 className="text-xl font-semibold text-slate-900">Popularity</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Report of item popularity by categories and ranges.
          </p>
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/popularityreport")}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left">
          <h2 className="text-xl font-semibold text-slate-900">Operation</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Report of library activities including loans, returns, lost items,
            new items, and new patrons.
          </p>
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/overduereport")}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left">
          <h2 className="text-xl font-semibold text-slate-900">Fine Summary</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Report of fines, paid amounts, and remaining balances.
          </p>
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/fine-summary")}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left">
          <h2 className="text-xl font-semibold text-slate-900">
            User Overview
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Report of all users in the system by role, status, and other
            information.
          </p>
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/patron-summary")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
