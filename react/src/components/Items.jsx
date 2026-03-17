import React from "react";
import PrimaryButton, { SecondaryButton } from "./Buttons";

export default function Item({ itemData }) {
  return (
    <div>
      <div className="grid grid-cols-4 rounded-xl bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
        <div className="col-span-3 m-2">
          <ItemHolder data={itemData} />
        </div>
        <div className="col-span-1 grid grid-rows-2 items-center m-2">
          <div className="grid grid-cols-2 grid-rows-2 text-center">
            <span>
              Available: <br />
              {itemData.available}
            </span>
            <span>
              On Hold: <br />
              {itemData.onHold}
            </span>
            <span>
              Unavailable: <br />
              {itemData.unavailable}
            </span>
            {itemData.category != "equipment" ? (
              <span>
                Shelf: <br />
                {itemData.shelfNumber}
              </span>
            ) : null}
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

export function ItemLoan({ itemData }) {
  return (
    <div>
      <div className="grid grid-cols-4 rounded-xl bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
        <div className="col-span-3 m-2">
          <ItemHolder data={itemData} />
        </div>
        {itemData.overdue ? (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <div>Due: {itemData.loanEnd}</div>
            <div>Item Overdue</div>
          </div>
        ) : (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <div>Due: {itemData.loanEnd}</div>
          </div>
        )}
      </div>
    </div>
  );
}
export function ItemHold({ itemData }) {
  return (
    <div>
      <div className="grid grid-cols-4 rounded-xl bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
        <div className="col-span-3 m-2">
          <ItemHolder data={itemData} />
        </div>
        {itemData.ready ? (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <span>Item ready to pickup</span>
            <PrimaryButton title="Cancel" />
          </div>
        ) : (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <span>Item not ready</span>
            <PrimaryButton title="Cancel" />
          </div>
        )}
      </div>
    </div>
  );
}

export function ItemHolder({ data }) {
  return (
    <div className="inline">
      {data.category != "equipment" ? (
        <div>
          <h3 className="text-xl font-bold">{data.title}</h3>
          {data.category == "book" ? (
            <div>
              <div className="text-lg font-semibold text-sky-300">
                {data.author.lastName}, {data.author.firstName}
              </div>
              <div>
                {data.publisher}, {data.publicationDate}
              </div>
            </div>
          ) : data.category == "periodical" ? (
            <div>
              <div className="text-lg font-semibold text-sky-300">
                Vol. {data.vol}, no. {data.no}
              </div>
              <div>
                {data.publisher}, {data.publicationDate}
              </div>
            </div>
          ) : (
            <div>
              {data.publisher}, {data.publicationDate}
            </div>
          )}
          <div>
            {data.type}, {data.language}, {data.genre}
            {data.category == "audiovisualmedia" ? (
              <span>, {data.runtime} mins</span>
            ) : null}
          </div>
          <div>{data.summary}</div>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-bold">{data.title}</h3>
        </div>
      )}
    </div>
  );
}
