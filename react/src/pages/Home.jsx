export default function Home() {
  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-500/20 via-slate-900 to-slate-950 px-6 py-10 shadow-2xl shadow-slate-950/40 sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
          Team Project 2026 Spring
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Library Database System
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
          Welcome to the library. Search books, manage your account, and move
          between project pages from a single interface.
        </p>
      </header>

      <main className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
            Welcome
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Start with search or account management
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Use the navigation above to browse the current project pages,
            including registration, reporting, search, and testing screens.
          </p>
        </section>

        <aside className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Project Scope
          </p>
          <p className="mt-3 text-base leading-7 text-slate-300">
            This interface is set up as a central entry point for the library
            database workflow and related course deliverables.
          </p>
        </aside>
      </main>

      <footer className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/30">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          Team
        </p>
        <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <p>Library System © TeamProject 2026 Spring</p>
          <p>By Azan, Mehrab U</p>
          <p>Lin, Evan</p>
          <p>Chukwu, David David</p>
          <p>Morin, Rainer Diamond</p>
          <p>Patel, Devkumar</p>
        </div>
      </footer>
    </div>
  );
}
