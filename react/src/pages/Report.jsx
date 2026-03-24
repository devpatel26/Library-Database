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
        Reporting screens can live here for overdue items, activity summaries,
        and database insights.
      </p>
      <div className="mt-6">
  <h2 className="text-xl font-bold mb-2">Books</h2>
  <table className="w-full border border-white/20">
    <tr>
      <th>ID</th>
      <th>Title</th>
    </tr>
    <tr>
      <td>1</td>
      <td>Database Systems</td>
    </tr>
  </table>

  <h2 className="text-xl font-bold mt-6 mb-2">Users</h2>
  <table className="w-full border border-white/20">
    <tr>
      <th>ID</th>
      <th>Name</th>
    </tr>
    <tr>
      <td>1</td>
      <td>David</td>
    </tr>
  </table>

  <h2 className="text-xl font-bold mt-6 mb-2">Loans</h2>
  <table className="w-full border border-white/20">
    <tr>
      <th>Loan ID</th>
      <th>Book</th>
    </tr>
    <tr>
      <td>1</td>
      <td>Database Systems</td>
    </tr>
  </table>
</div>
    </section>
  );
}
