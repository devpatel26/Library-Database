import { ReadStoredUser } from "../api";
import { CarouselItem } from "../components/Items";
import {
  dummyBooks,
  dummyAVM,
  dummyEquipment,
  dummyPeriodicals,
} from "../data/dummy/items";

export default function Home() {
  const user = ReadStoredUser();

  const welcomeName = user?.first_name
    ? `Welcome back, ${user.first_name}.`
    : "Welcome to Datahaven Library.";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        {welcomeName}
      </h1>
      <p className="mt-2 text-sm text-slate-300">
        Browse the latest additions across the collection.
      </p>

      <div className="mt-8 space-y-12">
        <section>
          <h2 className="text-lg font-semibold text-sky-300">Recent Books</h2>
          <div className="mt-5 flex flex-wrap justify-center gap-8">
            {dummyBooks.map((item, index) => (
              <CarouselItem key={index} itemData={item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-sky-300">
            Recent Periodicals
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-8">
            {dummyPeriodicals.map((item, index) => (
              <CarouselItem key={index} itemData={item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-sky-300">
            Recent Audiovisual Media
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-8">
            {dummyAVM.map((item, index) => (
              <CarouselItem key={index} itemData={item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-sky-300">
            Recent Equipment
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-8">
            {dummyEquipment.map((item, index) => (
              <CarouselItem key={index} itemData={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
