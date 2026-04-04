import { Link } from "react-router-dom";
import { ReadStoredUser } from "../api";

const shelfBooks = [
  { label: "Stories", height: "8.5rem", tone: "from-amber-200 to-orange-400" },
  { label: "Media", height: "7rem", tone: "from-rose-200 to-rose-400" },
  { label: "Journals", height: "9.25rem", tone: "from-emerald-200 to-emerald-400" },
  { label: "Archives", height: "7.75rem", tone: "from-sky-200 to-cyan-400" },
  { label: "Research", height: "8.75rem", tone: "from-yellow-100 to-amber-300" },
  { label: "Gear", height: "6.75rem", tone: "from-violet-200 to-fuchsia-400" },
];

const collectionHighlights = [
  {
    title: "Books",
    description:
      "Browse the core collection for fiction, nonfiction, course materials, and reference titles.",
    accent: "text-amber-200",
    tone: "from-amber-400/20 to-orange-500/10",
  },
  {
    title: "Periodicals",
    description:
      "Keep up with journals, magazines, and recurring publications from the same search flow.",
    accent: "text-emerald-200",
    tone: "from-emerald-400/20 to-teal-500/10",
  },
  {
    title: "Audiovisual Media",
    description:
      "Find films, recordings, and other media alongside the rest of the library catalog.",
    accent: "text-sky-200",
    tone: "from-sky-400/20 to-cyan-500/10",
  },
  {
    title: "Equipment",
    description:
      "Track devices and checkout-ready equipment like they belong on the same circulation desk.",
    accent: "text-rose-200",
    tone: "from-rose-400/20 to-orange-500/10",
  },
];

function ShelfIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-lg rounded-[2rem] border border-amber-100/15 bg-[#241711]/85 p-6 shadow-2xl shadow-black/25 backdrop-blur">
      <div className="absolute inset-x-8 top-24 h-px bg-gradient-to-r from-transparent via-amber-100/40 to-transparent" />

      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/80">
        Featured Shelf
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        A reading room feel instead of a project placeholder
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-stone-300">
        Warm tones, visible collections, and clear paths into the catalog make
        the front page feel closer to a real library lobby.
      </p>

      <div className="mt-8 rounded-[1.75rem] border border-white/8 bg-[#140d09]/80 p-5">
        <div className="flex items-end justify-between gap-2">
          {shelfBooks.map((book) => (
            <div
              key={book.label}
              className={`flex w-11 items-end justify-center rounded-t-2xl border border-black/10 bg-gradient-to-b ${book.tone} px-1 pb-4 shadow-lg shadow-black/10`}
              style={{ height: book.height }}
            >
              <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em] text-[#2b1508]">
                {book.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#4b3528]" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-100/10 bg-black/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
            Quiet Corners
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-300">
            Search, borrow, and manage your account without hunting through the
            interface.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100/10 bg-black/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
            Circulation Desk
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-300">
            Holds, fines, reports, and item management stay close at hand for
            staff workflows.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const user = ReadStoredUser();
  const isStaff = user?.user_type === "staff";
  const isAdmin = isStaff && Number(user?.role) === 2;

  const serviceHighlights = [
    {
      title: "Catalog Search",
      description: "Books, periodicals, audiovisual media, and equipment.",
    },
    {
      title: "Patron Account",
      description: "Keep loans, fines, and holds gathered in one place.",
    },
    {
      title: "Staff Tools",
      description: "Support circulation work without leaving the main system.",
    },
  ];

  const quickLinks = [
    {
      to: "/search",
      eyebrow: "Browse",
      title: "Search the catalog",
      description:
        "Look through the stacks by keyword and filter the collection by category.",
    },
    user
      ? {
          to: "/account",
          eyebrow: "Account",
          title: "Open your library card view",
          description:
            "Check your loans, holds, recent activity, and any outstanding fines.",
        }
      : {
          to: "/login",
          eyebrow: "Sign In",
          title: "Log in to start borrowing",
          description:
            "Access patron tools, save your place in the workflow, and manage your account.",
        },
    ...(isStaff
      ? [
          {
            to: "/staffloans",
            eyebrow: "Desk",
            title: "Manage circulation",
            description:
              "Handle active loans and keep checkouts moving like a real service desk.",
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            to: "/report",
            eyebrow: "Reports",
            title: "Review library activity",
            description:
              "Open reporting tools for popularity, overdue items, and account summaries.",
          },
        ]
      : []),
  ];

  const welcomeName = user?.first_name ? `Welcome back, ${user.first_name}.` : "Welcome to Datahaven.";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-amber-100/10 bg-[linear-gradient(135deg,rgba(71,43,25,0.98),rgba(35,21,17,0.96)_42%,rgba(15,23,42,0.98)_100%)] px-6 py-8 shadow-2xl shadow-black/30 sm:px-10 sm:py-10">
        <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-amber-300/12 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-200">
              Reading Room
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              A home page that feels more like walking into a library.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-200 sm:text-lg">
              {welcomeName} Move from discovery to checkout with a warmer front
              page, clearer paths into the catalog, and sections that look like
              shelves instead of generic project panels.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="rounded-full border border-amber-200/40 bg-amber-200 px-5 py-3 text-sm font-semibold text-[#2b1508] transition hover:bg-amber-100"
              >
                Browse the catalog
              </Link>
              <Link
                to={user ? "/account" : "/login"}
                className="rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                {user ? "Open my account" : "Sign in to borrow"}
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {serviceHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-black/15 p-4 backdrop-blur"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ShelfIllustration />
        </div>
      </section>

      <main className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-amber-100/10 bg-[#181110] p-8 shadow-xl shadow-slate-950/30">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
            Quick Paths
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Find your way through the stacks
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
            The front page now points people toward the parts of the system that
            feel most like a library: searching, borrowing, circulation, and
            reports.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group rounded-[1.6rem] border border-white/8 bg-gradient-to-br from-white/5 to-transparent p-5 transition hover:border-amber-200/25 hover:bg-white/6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">
                  {item.eyebrow}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white transition group-hover:text-amber-100">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  {item.description}
                </p>
                <p className="mt-5 text-sm font-semibold text-amber-200">
                  Open section
                </p>
              </Link>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-amber-100/10 bg-gradient-to-b from-[#2c1d15] to-[#16110d] p-8 shadow-xl shadow-slate-950/30">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
            Library Notes
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Built around how people actually use a library
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-sm font-semibold text-white">Discover</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Search is framed like entering the stacks, so discovery is the
                first thing people see.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-sm font-semibold text-white">Borrow</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Patron actions stay close to the top level instead of being
                buried under project-specific language.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-sm font-semibold text-white">Manage</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Staff tools still fit the same experience, which helps the whole
                app feel like one shared library system.
              </p>
            </div>
          </div>
        </aside>
      </main>

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
              Collections
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              The shelves match the real sections in your app
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            Instead of generic homepage filler, the content now points directly
            at the kinds of materials your library database already supports.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {collectionHighlights.map((item) => (
            <div
              key={item.title}
              className={`rounded-[1.6rem] border border-white/10 bg-gradient-to-br ${item.tone} p-5`}
            >
              <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${item.accent}`}>
                Shelf
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="rounded-3xl border border-amber-100/10 bg-[#181110] p-8 shadow-xl shadow-slate-950/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
              Datahaven Library
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Library Database System
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-300">
              The landing page now leans into a library atmosphere while keeping
              the project identity and navigation intact.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-stone-300 sm:grid-cols-2">
            <p>Library System © Team Project 2026 Spring</p>
            <p>By Azan, Mehrab U</p>
            <p>Lin, Evan</p>
            <p>Chukwu, David David</p>
            <p>Morin, Rainer Diamond</p>
            <p>Patel, Devkumar</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
