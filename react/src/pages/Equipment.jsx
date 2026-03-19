import Fine from "../components/Fine";
import dummyFines from "../data/dummy/fines";
import { useState, useEffect } from "react";
import PrimaryButton, {
  SecondaryButton,
  SubmitButton,
} from "../components/Buttons";
import Dropdown from "../components/Dropdown";

export default function Equipment() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Equipment Entry
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Equipment Entry Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Enter equipment information below.
      </p>
      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        <form method="post">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-x-6 ">
              <div className="col-span-2">
                <label htmlFor="title">Equipment Name</label>
                <div className="mt-2">
                  <input
                    required
                    id="title"
                    name="title"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="copies">Copies</label>
                <div className="mt-2">
                  <input
                    required
                    type="number"
                    id="copies"
                    name="copies"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="grid justify-center mt-4">
                <SubmitButton title={"Submit"} value={"OK"} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
