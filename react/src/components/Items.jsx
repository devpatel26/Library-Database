import React from "react";
import PrimaryButton, { SecondaryButton } from "./Buttons";

export default function Item({ itemData }) {
  return (
    <div className="w-full">
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
      <PrimaryButton
        title="Place Hold"
        onClick={async () => {
          const user = JSON.parse(localStorage.getItem("user"));

          if (!user) {
            alert("Please log in first.");
            window.location.href = "/login";
            return;
          }

          if (user.user_type !== "patron") {
            alert("Only patrons can place holds.");
            return;
          }

          try {
            const response = await fetch("http://localhost:3000/holds", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                item_id: itemData.itemId,
                patron_id: user.patron_id,
              }),
            });

            const text = await response.text();
            console.log("holds status:", response.status);
            console.log("holds raw response:", text);

            let data;
            try {
              data = JSON.parse(text);
            } catch {
              throw new Error("Server did not return JSON.");
            }

            if (!response.ok) {
              throw new Error(data.error || "Failed to place hold.");
            }
            alert("Hold placed successfully!");
            window.location.reload();
          } catch (error) {
            console.error(error);
            alert(error.message || "Failed to place hold.");
          }
        }}
  />
) : (
  <SecondaryButton title="Unavailable" disabled={true} />
)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ItemStaff({ itemData }) {
  return (
    <div>
      <div className="grid grid-cols-4 rounded-xl bg-white/2 px-3 py-1.5 outline-2 -outline-offset-1 outline-white/6">
        <div className="col-span-2 m-2">
          <ItemHolder data={itemData} />
        </div>
        <div className="col-span-2 grid grid-cols-2 items-center m-2">
          {itemData.status == "Available" ? (
            <div className="grid grid-rows-2 col-span-1">
              <div>
                Copy number: {itemData.copy}
              </div>
              <div>
                Item status: {itemData.status}
              </div>
            </div>
          ) : itemData.status == "On hold" ? (
            <div className="grid grid-rows-4 col-span-1">
              <div>
                Copy number: {itemData.copy}
              </div>
              <div>
                Item status: {itemData.status}
              </div>
              <div>
                On hold until {itemData.holdEnd}
              </div>
              <div>
                Held by user {itemData.userid}
              </div>
            </div>
          ) : itemData.status == "Loaned" ? (
            <div className="grid grid-rows-4 col-span-1">
              <div>
                Copy number: {itemData.copy}
              </div>
              <div>
                Item status: {itemData.status}
              </div>
              <div>
                Loaned until {itemData.loanEnd}
              </div>
              <div>
                Loaned by user {itemData.userid}
              </div>
            </div>
          ) : (
            <div className="grid grid-rows-2 col-span-1">
              <div>
                Copy number: {itemData.copy}
              </div>
              <div>
                Item status: {itemData.status}
              </div>
            </div>
          )}
          <div className="col-span-1 items-center justify-items-center text-center">
            {itemData.status == "On hold" ? (
              <div>
                <SecondaryButton title="Cancel hold" />
              </div>
            ) : itemData.status == "Loaned" ? (
              <div>
                <PrimaryButton title="Mark as returned" />
                <SecondaryButton title="Mark as missing" />
              </div>
            ) : itemData.status == "Available" ? (
              <SecondaryButton title="Mark as missing" />
            ) : null}
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
            <div>
              Due: {itemData.loanEnd}
            </div>
            <div>
              Item Overdue
            </div>
          </div>
        ) : (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <div>
              Due: {itemData.loanEnd}
            </div>
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
            <span>
              Item ready to pickup
            </span>
            <PrimaryButton title="Cancel" />
          </div>
        ) : (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <span>
              Item not ready
            </span>
            <PrimaryButton title="Cancel" />
          </div>
        )}
      </div>
    </div>
  );
}

export function ItemHolder({ data }) {
  const creator =
    data.creator ??
    (data.author ? `${data.author.lastName}, ${data.author.firstName}` : null);
  const pubLine = [data.publisher, data.publicationDate]
    .filter(Boolean)
    .join(", ");
  const metaLine = [data.type, data.language, data.genre]
    .filter(Boolean)
    .join(", ");

  if (data.category === "equipment") {
    return (
      <div>
        <h3 className="text-xl font-bold">{data.title}</h3>
      </div>
    );
  }

  return (
    <div className="inline">
      <div>
        <h3 className="text-xl font-bold">{data.title}</h3>
        {creator && (
          <div className="text-lg font-semibold text-sky-300">{creator}</div>
        )}
        {pubLine && <div>{pubLine}</div>}
        {metaLine && (
          <div>
            {metaLine}
            {data.category === "audiovisualmedia" && data.runtime
              ? `, ${data.runtime} mins`
              : ""}
          </div>
        )}
        {data.summary && <div>{data.summary}</div>}
      </div>
    </div>
  );
}
