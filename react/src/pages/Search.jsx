import PrimaryButton, { SecondaryButton, SubmitButton } from "../components/Buttons";
import Item, { ItemHold, ItemLoan, ItemStaff } from "../components/Items";
import dummyBaseItemsPatron, {
  dummyBaseItemsStaff,
  dummyItemLoans,
  dummyItemHolds,
} from "../data/dummy/items";

export default function Search() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Search
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Search Page
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        This page is for book, author, and inventory search features.
      </p>
      <form method="post">
        <div className="grid gap-x-6 gap-y-12 grid-cols-6 mt-2">
          <div className="sm:col-span-4">
            <label htmlFor="searchterm">Search Term</label>
            <div className="mt-2">
              <input
                required
                id="searchterm"
                name="searchterm"
                type="searchterm"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="category">Category</label>
            <div className="mt-2">
              <select
                required
                id="category"
                name="category"
                type="category"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              >
                <option value="book">Book</option>
                <option value="audiovisualmedia">Audiovisual Media</option>
                <option value="periodical">Periodicals</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
          </div>

          <div className="grid justify-items-start col-span-1 items-end">
            <SubmitButton title={"Register"} value={"OK"} />
          </div>
        </div>
      </form>
      <div className="flex gap-6 flex-wrap justify-evenly mt-6">
        {dummyBaseItemsPatron.map((item, index) => (
          <Item key={index} itemData={item} />
        ))}
      </div>
    </section>
  );
}
