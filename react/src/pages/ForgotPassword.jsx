import { SubmitButton } from "../components/Buttons";

export default function ForgotPassword() {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center shadow-xl shadow-slate-950/30 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Account Recovery
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Forgot Password
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Enter the email address
      </p>
      <form
        className="flex w-full flex-col items-center"
        onSubmit={(event) => {
          event.preventDefault();
          alert("Password reset email delivery is not configured yet.");
        }}
      >
        <label
          htmlFor="recovery-email"
          className="mt-6 w-full max-w-md text-left text-sm font-medium text-slate-200"
        >
          Email
        </label>
        <input
          required
          id="recovery-email"
          name="email"
          type="email"
          placeholder="name@example.com"
          className="mt-2 block w-full max-w-md rounded-md bg-white/5 px-3 py-2 text-slate-100 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
        />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <SubmitButton title={"Send Reset Link"} />
        </div>
      </form>
    </section>
  );
}
