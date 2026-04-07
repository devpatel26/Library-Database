import { Link } from "react-router-dom";
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
  const isStaff = user?.user_type === "staff";
  const isAdmin = isStaff && Number(user?.role) === 2;

  const welcomeName = user?.first_name
    ? `Welcome back, ${user.first_name}.`
    : "Welcome to Datahaven Library.";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 ">
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Recent Items
      </h1>

      <div className="grid grid-rows-7 mt-4 w-full gap-8">
        <div className="row-span-2">
          <h2 className="font-semibold text-sky-300">Recent Books</h2>
          <div className="flex gap-8 justify-center mt-6">
            {dummyBooks.map((item, index) => (
              <CarouselItem key={index} itemData={item} />
            ))}
          </div>
        </div>
        <div className="row-span-2">
          <h2 className="font-semibold text-sky-300">Recent Periodicals</h2>
          <div className="flex gap-8 justify-center mt-6">
            {dummyPeriodicals.map((item, index) => (
              <CarouselItem key={index} itemData={item} />
            ))}
          </div>
        </div>
        <div className="row-span-2">
          <h2 className="font-semibold text-sky-300">
            Recent Audiovisual Media
          </h2>
          <div className="flex gap-8 justify-center mt-6">
            {dummyAVM.map((item, index) => (
              <CarouselItem key={index} itemData={item} />
            ))}
          </div>
        </div>
        <div className="row-span-1">
          <h2 className="font-semibold text-sky-300">Recent Equipment</h2>
          <div className="flex gap-8 justify-center mt-6">
            {dummyEquipment.map((item, index) => (
              <CarouselItem key={index} itemData={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
