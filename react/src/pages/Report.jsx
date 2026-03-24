export default function Report() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Reporting
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Report Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Select one of the available report options below.
      </p >

      <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <h2 className="text-xl font-semibold text-white">
            Most Borrowed Books
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            View the books with the highest total number of loans.
          </p >
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/mostborrowedbooks")}
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
              onClick={() => navigate("/report/patronsummary")}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <h2 className="text-xl font-semibold text-white">
            Testing
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Temporary placeholder report page for testing future report ideas.
          </p >
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              title="Open Report"
              onClick={() => navigate("/report/testing")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
