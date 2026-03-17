import Fine from "../components/Fine";
import dummyFines from "../data/dummy/fines";

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
      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        {dummyFines.map((item, index) => (
          <Fine key={index} data={item} />
        ))}
      </div>
    </section>
  );
}
