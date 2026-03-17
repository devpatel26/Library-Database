import Fine from "../components/Fine";

export default function Fines() {
  const dummyFine1 = {
    amount: 1.5,
    date: "10-02-2025",
    paidStatus: true,
    waiveStatus: false,
  };
  const dummyFine2 = {
    amount: 2.5,
    date: "10-12-2025",
    paidStatus: true,
    waiveStatus: true,
  };
  const dummyFine3 = {
    amount: 1.0,
    date: "09-13-2025",
    paidStatus: false,
    waiveStatus: false,
  };
  const dummyFine4 = {
    amount: 1.25,
    date: "10-14-2025",
    paidStatus: false,
    waiveStatus: true,
  };
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
      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        <Fine data={dummyFine1} />
        <Fine data={dummyFine2} />
        <Fine data={dummyFine3} />
        <Fine data={dummyFine4} />
      </div>
    </section>
  );
}
