import React from "react";

export default function MostBorrowedBooksReport() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Report
      </p >
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Most Borrowed Books
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-300">
        This report page is ready. The SQL and table display will be added next.
      </p >
    </section>
  );
}