import React from "react";
import InputComponent from "../components/InputComponent";
import PrimaryButton, {
  SecondaryButton,
  SubmitButton,
} from "../components/Buttons";

export default function Registration() {
  return (
    // mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center shadow-xl shadow-slate-950/3
    // rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30 text-center grid justify-items-center
    <section className="mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center shadow-xl shadow-slate-950/3">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Registration
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Registration
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        New library members can be onboarded here once the registration form is
        added.
      </p>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 mb-2">
        Register an account with the below form:
      </p>
      <form method="post">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-9">
            <div className="sm:col-span-3">
              <label htmlFor="firstname">First Name</label>
              <div className="mt-2">
                <input
                  required
                  id="firstname"
                  name="firstname"
                  type="firstname"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="lastname">Last Name</label>
              <div className="mt-2">
                <input
                  required
                  id="lastname"
                  name="lastname"
                  type="lastname"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <div>
                <label htmlFor="birthday">Date of Birth</label>
                <div className="mt-2">
                  <input
                    required
                    id="birthday"
                    name="birthday"
                    type="text"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="email">Email</label>
              <div className="mt-2">
                <input
                  required
                  id="email"
                  name="email"
                  type="email"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <div>
                <label htmlFor="password">Password</label>
                <div className="mt-2">
                  <input
                    required
                    id="password"
                    name="password"
                    type="password"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid justify-center">
            <SubmitButton title={"Register"} value={"OK"} />
          </div>
        </div>
      </form>
    </section>
  );
}
