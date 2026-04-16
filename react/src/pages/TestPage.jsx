export default function TestPage() {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-lg">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-900">
          Testing
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          Test Page
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          This view is set up for isolated component checks and quick UI
          validation.
        </p>
      </div>
    </div>
  );
}
