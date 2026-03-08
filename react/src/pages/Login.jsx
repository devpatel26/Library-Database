import PrimaryButton, { SubmitButton } from "../components/Buttons";

export default function Login() {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Login
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Login
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Email
      </p>
      <input
        required
        id="email"
        name="email"
        type="email"
        className="block w-full max-w-md rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
      />
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Password
      </p>
      <input
        required
        id="password"
        name="password"
        type="password"
        className="block w-full max-w-md rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
      />
      <div className="grid justify-center pt-6">
        <SubmitButton title={"Login"} value={"OK"} />
      </div>
      <p className="mt-4 text-sm text-slate-400">
        Don't have an account?{" "}
        <a href="/registration" className="text-sky-300 hover:text-sky-200">
          Register
        </a>
      </p>
      <p className="mt-4 text-sm text-slate-400">
        Staff registration?{" "}
        <a href="/staffregistration" className="text-sky-300 hover:text-sky-200">
          Register
        </a>
      </p>
      <p className="mt-4 text-sm text-slate-400">
        Forgot your password?{" "}
        <a href="/forgot-password" className="text-sky-300 hover:text-sky-200">
          Reset it
        </a>
      </p>
    </section>
  );
}
