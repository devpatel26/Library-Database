import TestComponentNoData from "../components/TestComponentNoData";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import Item, { ItemHold, ItemLoan, ItemStaff } from "../components/Items";
import Fine, { FineStaff } from "../components/Fine";
import dummyFines from "../data/dummy/fines";
import dummyBaseItemsPatron, {
  dummyBaseItemsStaff,
} from "../data/dummy/items";

export default function TestPage() {
  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          Testing
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Test Page
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          This view is set up for isolated component checks and quick UI
          validation.
        </p>
      </div>
      <TestComponentNoData />
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Button Tests
      </p>
      <PrimaryButton title={"Primary Button"} />
      <SecondaryButton title={"Secondary Button"} />
      <div>
        <SecondaryButton title={"Cancel"} />
        <PrimaryButton title={"Register"} />
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Tests for fines (patron)
      </p>

      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        {dummyFines.map((item, index) => (
          <Fine key={index} data={item} />
        ))}
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Tests for fines (staff)
      </p>

      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        {dummyFines.map((item, index) => (
          <FineStaff key={index} data={item} />
        ))}
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Tests for search view (patron)
      </p>
      {dummyBaseItemsPatron.map((item, index) => (
        <Item key={index} itemData={item} />
      ))}
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Tests for search view (staff)
      </p>
      {dummyBaseItemsStaff.map((item, index) => (
        <ItemStaff key={index} itemData={item} />
      ))}
    </div>
  );
}
