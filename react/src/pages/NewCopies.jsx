import Fine from "../components/Fine";
import dummyFines from "../data/dummy/fines";
import { useState, useEffect } from "react";
import PrimaryButton, {
  SecondaryButton,
  SubmitButton,
} from "../components/Buttons";
import Dropdown from "../components/Dropdown";

export default function NewCopies() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        New Copy Entry
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        New Copy Entry Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Search for copy to increment below.
      </p>
      <form action="/search" method="GET">
        <div className="grid gap-x-6 gap-y-12 grid-cols-8 mt-2">
          <div className="sm:col-span-4">
            <label htmlFor="q">Search Term</label>
            <div className="mt-2">
              <input
                required
                id="q"
                name="q"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="category">Category</label>
            <div className="mt-2">
              <select
                required
                id="category"
                name="category"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              >
                <option value="book">Book</option>
                <option value="audiovisualmedia">Audiovisual Media</option>
                <option value="periodical">Periodicals</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-1 grid">
            <label htmlFor="availableOnly">Available Only</label>
            <div className="mt-2 mt-2 scale-150">
              <input
                type="checkbox"
                id="availableOnly"
                name="availableOnly"
                className="block w-full rounded-md bg-white/5 px-3 m:text-sm/6"
              />
            </div>
          </div>

          <div className="grid justify-items-start col-span-1 items-end">
            <SubmitButton title={"Search"} value={"OK"} />
          </div>
        </div>
      </form>
      <div id="results" className="flex gap-6 flex-wrap justify-evenly mt-6">
        {/* {dummyBaseItemsPatron.map((item, index) => (
          <Item key={index} itemData={item} />
        ))} */}
        {/* {res.results.map((item, index) => (
          <Item key={index} itemData={item} />
        ))} */}
      </div>
    </section>
  );
}
