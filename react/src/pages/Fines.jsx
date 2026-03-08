import Fine from "../components/Fine";

export default function Fines() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Fines
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Fine Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Lists of fines can be found here.
      </p>
      <div class="flex gap-4 flex-wrap justify-evenly mt-4">
        {/*grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-3 mt-2 justify-center"*/}
        <Fine amount={"1.50"} date={"3/7/2026"} paidStatus={true} />
        <Fine amount={"2.75"} date={"3/4/2026"} paidStatus={false} />
        <Fine amount={"3.00"} date={"2/27/2026"} paidStatus={true} />
        <Fine amount={"1.00"} date={"2/23/2026"} paidStatus={false} />
        <Fine amount={"10.25"} date={"2/13/2026"} paidStatus={true} />
      </div>
    </section>
  );
}
