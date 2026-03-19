import Fine from "../components/Fine";
import dummyFines from "../data/dummy/fines";
import { useState, useEffect } from "react";

export default function Periodicals() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Periodical Entry
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Periodical Entry Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Enter periodical information below.
      </p>
      <div className="flex gap-4 flex-wrap justify-evenly mt-4"></div>
    </section>
  );
}
