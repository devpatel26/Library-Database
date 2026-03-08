import React from "react";
// import PrimaryButton, { SecondaryButton } from "./Buttons";
import PrimaryButton, { SecondaryButton } from "./Buttons";

export default function Item({ itemType: ItemType, itemData }) {
  return (
    <div>
      <div className="grid grid-cols-4 rounded-xl bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
        <div className="col-span-3 m-2">
          <ItemType data={itemData} />
        </div>
        <div className="col-span-1 grid grid-rows-2 items-center m-2">
          <div className="grid grid-cols-2 grid-rows-2 text-center">
            <span>Available: {itemData.available}</span>
            <span>On Hold: {itemData.onHold}</span>
            <span>Unavailable: {itemData.unavailable}</span>
            <span>Shelf: {itemData.shelfNumber}</span>
          </div>
          <div className="h-full justify-items-center grid">
            {itemData.available >= 1 ? (
              <PrimaryButton title="Place Hold" />
            ) : (
              <SecondaryButton title={"Unavailable"} disabled={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Book({ data }) {
  return (
    <div className="inline">
      <h3 className="text-xl font-bold">{data.title}</h3>
      <div className="text-lg font-semibold text-sky-300">
        {data.author.lastName}, {data.author.firstName}
      </div>
      <div>
        {data.publisher}, {data.publicationDate}.
      </div>
      <div>
        {data.type}, {data.language}, {data.genre}
      </div>
      <div>{data.summary}</div>
    </div>
  );
}

export function Periodical({ data }) {
  return <div className="inline"></div>;
}

export function AudiovisualMedia({ data }) {
  return <div className="inline"></div>;
}

export function Equipment({ data }) {
  return <div className="inline"></div>;
}
