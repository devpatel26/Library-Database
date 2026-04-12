import { useState } from "react";
import PrimaryButton, { SecondaryButton } from "./Buttons";
import { FetchJson, ReadStoredUser } from "../api";
import { FormatTime, FormatDate } from "./TimeFormats";
import { useMessage } from "../hooks/useMessage";

function BuildDisplayDate(value, includeTime = false) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return includeTime ? FormatDate(date, true) : FormatDate(date);
}

export default function Item({ itemData }) {
  const user = ReadStoredUser();
  const { showSuccess, showError, showWarning /*showInfo */ } = useMessage();

  const [activeStaffAction, setActiveStaffAction] = useState("");
  const [patronIdInput, setPatronIdInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function ResetStaffAction() {
    setActiveStaffAction("");
    setPatronIdInput("");
  }

  function RequireLoggedInUser() {
    if (user) {
      return true;
    }

    showWarning("Please log in first.", 1200);

    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);

    return false;
  }

  async function HandlePatronHold() {
    if (!RequireLoggedInUser()) {
      return;
    }

    if (!user) return null;
    try {
      setIsSubmitting(true);

      await FetchJson("/api/holds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: itemData.itemId,
          patron_id: user.patron_id,
        }),
      });

      showSuccess("Hold placed successfully!");

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to place hold.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function OpenStaffAction(actionType) {
    if (!RequireLoggedInUser()) {
      return;
    }

    if (user.user_type !== "staff") {
      showWarning("Only staff can perform this action.");
      return;
    }

    setActiveStaffAction(actionType);
    setPatronIdInput("");
  }

  async function ConfirmStaffAction() {
    const patronId = Number(patronIdInput);

    if (!Number.isInteger(patronId) || patronId < 1) {
      showWarning("Enter a valid patron ID.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (activeStaffAction === "hold") {
        await FetchJson("/api/holds", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_id: itemData.itemId,
            patron_id: patronId,
          }),
        });

        showSuccess("Hold placed successfully!");
      } else if (activeStaffAction === "checkout") {
        await FetchJson("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_id: itemData.itemId,
            patron_id: patronId,
          }),
        });

        showSuccess("Checkout successful!");
      } else {
        showWarning("Choose an action first.");
        return;
      }

      ResetStaffAction();

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error(error);

      if (activeStaffAction === "hold") {
        showError(error.message || "Failed to place hold.");
      } else {
        showError(error.message || "Failed to check out item.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isStaff = user?.user_type === "staff";
  const canPlaceHold = Number(itemData.is_removed ?? 0) !== 1;

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 rounded-xl bg-white/2 px-3 py-1.5 outline-2 outline-white/10">
        {itemData.category != "equipment" ? (
          <div className="col-span-3 m-2 flex gap-4">
            <img src="../public/Datahaven.jpg" className="h-48 w-36" />
            <ItemHolder data={itemData} />
          </div>
        ) : (
          <div className="col-span-3 m-2">
            <ItemHolder data={itemData} />
          </div>
        )}

        <div className="col-span-1 grid grid-rows-2 items-center m-2">
          <div className="grid grid-cols-3 grid-rows-2 text-center">
            <span>
              Available: <br />
              {itemData.available}
            </span>

            <span>
              Reserved: <br />
              {itemData.reservedCount ?? 0}
            </span>

            <span>
              Queue: <br />
              {itemData.queueCount ?? 0}
            </span>

            <span>
              Unavailable: <br />
              {itemData.unavailable}
            </span>

            {itemData.category !== "equipment" ? (
              <span>
                Shelf: <br />
                {itemData.shelfNumber}
              </span>
            ) : null}
          </div>

          <div className="grid h-full justify-items-center gap-2">
            {canPlaceHold ? (
              isStaff ? (
                <>
                  <PrimaryButton
                    title="Place Hold"
                    onClick={() => OpenStaffAction("hold")}
                  />

                  <PrimaryButton
                    title="Check Out"
                    onClick={() => OpenStaffAction("checkout")}
                  />

                  {activeStaffAction ? (
                    <div className="mt-2 flex w-full flex-col gap-2 rounded-lg border border-white/10 bg-slate-900/70 p-3">
                      <div className="text-xs text-slate-300">
                        {activeStaffAction === "hold"
                          ? "Enter the patron ID for this hold."
                          : "Enter the patron ID for this checkout."}
                      </div>

                      <input
                        type="number"
                        min="1"
                        value={patronIdInput}
                        onChange={(event) =>
                          setPatronIdInput(event.target.value)
                        }
                        placeholder="Patron ID"
                        className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
                      />

                      <div className="flex gap-2">
                        <PrimaryButton
                          title={isSubmitting ? "Submitting..." : "Confirm"}
                          onClick={ConfirmStaffAction}
                          disabledValue={isSubmitting}
                        />

                        <SecondaryButton
                          title="Cancel"
                          onClick={ResetStaffAction}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <PrimaryButton
                  title="Place Hold"
                  onClick={HandlePatronHold}
                  disabledValue={isSubmitting}
                />
              )
            ) : (
              <SecondaryButton title="Unavailable" disabled={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CarouselItem({ itemData }) {
  return (
    <div className="w-70">
      {itemData.category != "equipment" ? (
        <div className="grid grid-rows-5 rounded-xl bg-white/2 px-3 py-1.5 outline-2 outline-white/10 transition transform hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10">
          <div className="row-span-4 m-2 mt-2">
            <CarouselItemHolder data={itemData} />
          </div>
          <div className="row-span-1 grid grid-cols-3 grid items-center m-2 text-center">
            <span>
              {itemData.available >= 1 ? "Available" : "Not Available"}
            </span>
            <span>Shelf: {itemData.shelfNumber}</span>
            {Number(itemData.is_removed ?? 0) !== 1 ? (
              <PrimaryButton title="Place Hold" />
            ) : (
              <SecondaryButton title="Not Available" disabled={true} />
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-rows-3 rounded-xl bg-white/2 px-3 py-1.5 outline-2 outline-white/10 text-center transition transform hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10">
          <div className="mt-2 row-span-1 text-xl font-bold">
            {itemData.title}
          </div>
          <div className="row-span-2 grid grid-cols-2 grid items-center m-2 text-center">
            <span>
              {itemData.available >= 1 ? "Available" : "Not Available"}
            </span>
            {Number(itemData.is_removed ?? 0) !== 1 ? (
              <PrimaryButton title="Place Hold" />
            ) : (
              <SecondaryButton title="Not Available" disabled={true} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CarouselItemHolder({ data }) {
  const creator =
    data.creator ??
    (data.author ? `${data.author.lastName}, ${data.author.firstName}` : null);

  const formattedDate = BuildDisplayDate(data.publicationDate);
  const pubLine = [data.publisher, formattedDate].filter(Boolean).join(", ");
  const metaLine = [data.type, data.language, data.genre]
    .filter(Boolean)
    .join(", ");

  if (data.category === "equipment") {
    return (
      <div>
        <div className="text-xl font-bold">{data.title}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <img src="../public/Datahaven.jpg" className="h-48 w-36" />
      <div className="text-xl mt-2 font-bold">{data.title}</div>

      {creator ? (
        <div className="text-lg font-semibold text-sky-300">{creator}</div>
      ) : null}

      {/* {pubLine ? <div>{pubLine}</div> : null} */}

      {metaLine ? (
        <div>
          {metaLine}
          {data.category === "audiovisualmedia" && data.runtime
            ? `, ${data.runtime} mins`
            : ""}
        </div>
      ) : null}

      {data.summary ? (
        data.summary.length > 120 ? (
          <div>{data.summary.slice(0, 120)}...</div>
        ) : (
          <div>{data.summary}</div>
        )
      ) : null}
    </div>
  );
}

export function ItemStaff({
  itemData,
  onCancelHold,
  onMarkReturned,
  onMarkMissing,
}) {
  const holdEnd = BuildDisplayDate(itemData.holdEnd, true);
  const loanEnd = BuildDisplayDate(itemData.loanEnd, true);

  return (
    <div>
      <div className="grid grid-cols-4 rounded-xl bg-white/2 px-3 py-1.5 outline-2 outline-white/10">
        {itemData.category != "equipment" ? (
          <div className="col-span-3 m-2 flex gap-4">
            <img src="../public/Datahaven.jpg" className="h-48 w-36" />
            <ItemHolder data={itemData} />
          </div>
        ) : (
          <div className="col-span-3 m-2">
            <ItemHolder data={itemData} />
          </div>
        )}

        <div className="col-span-1 grid grid-cols-2 items-center m-2">
          {itemData.status === "Available" ? (
            <div className="grid grid-rows-2 col-span-1">
              <div>Copy number: {itemData.copy}</div>
              <div>Item status: {itemData.status}</div>
            </div>
          ) : itemData.status === "On hold" ? (
            <div className="grid grid-rows-4 col-span-1">
              <div>Copy number: {itemData.copy}</div>
              <div>Item status: {itemData.status}</div>
              <div>On hold until {holdEnd}</div>
              <div>Held by user {itemData.userId ?? itemData.userid}</div>
            </div>
          ) : itemData.status === "Loaned" ? (
            <div className="grid grid-rows-4 col-span-1">
              <div>Copy number: {itemData.copy}</div>
              <div>Item status: {itemData.status}</div>
              <div>Loaned until {loanEnd}</div>
              <div>Loaned by user {itemData.userId ?? itemData.userid}</div>
            </div>
          ) : (
            <div className="grid grid-rows-2 col-span-1">
              <div>Copy number: {itemData.copy}</div>
              <div>Item status: {itemData.status}</div>
            </div>
          )}
        </div>

        <div className="col-span-1 items-center justify-items-center text-center m-2">
          {itemData.status === "On hold" ? (
            <div>
              <SecondaryButton
                title="Cancel hold"
                onClick={() => onCancelHold?.(itemData.holdId)}
              />
            </div>
          ) : itemData.status === "Loaned" ? (
            <div className="grid gap-2">
              <PrimaryButton
                title="Mark as returned"
                onClick={() => onMarkReturned?.(itemData.loanId)}
              />
              <SecondaryButton
                title="Mark as missing"
                onClick={() => onMarkMissing?.(itemData.loanId)}
              />
            </div>
          ) : itemData.status === "Available" ? (
            <SecondaryButton
              title="Mark as missing"
              onClick={() => onMarkMissing?.(itemData.itemId)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ItemLoan({ itemData }) {
  const formattedDate = BuildDisplayDate(itemData.loanEnd, true);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 rounded-xl bg-white/2 px-3 py-1.5 outline-2 outline-white/10">
        {itemData.category != "equipment" ? (
          <div className="col-span-3 m-2 flex gap-4">
            <img src="../public/Datahaven.jpg" className="h-48 w-36" />
            <ItemHolder data={itemData} />
          </div>
        ) : (
          <div className="col-span-3 m-2">
            <ItemHolder data={itemData} />
          </div>
        )}

        {itemData.overdue ? (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <div>Due: {formattedDate}</div>
            <div>Item overdue</div>
          </div>
        ) : (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <div>Due: {formattedDate}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ItemHold({ itemData, onCancel }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-4 rounded-xl bg-white/2 px-3 py-1.5 outline-2 outline-white/10">
        {itemData.category != "equipment" ? (
          <div className="col-span-3 m-2 flex gap-4">
            <img src="../public/Datahaven.jpg" className="h-48 w-36" />
            <ItemHolder data={itemData} />
          </div>
        ) : (
          <div className="col-span-3 m-2">
            <ItemHolder data={itemData} />
          </div>
        )}

        {itemData.ready ? (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <span>Item ready to pickup</span>
            <PrimaryButton
              title="Cancel"
              disabledValue={!onCancel}
              onClick={() => onCancel?.(itemData.holdId)}
            />
          </div>
        ) : (
          <div className="col-span-1 grid grid-rows-2 items-center text-center">
            <span>Item not ready</span>
            <PrimaryButton
              title="Cancel"
              disabledValue={!onCancel}
              onClick={() => onCancel?.(itemData.holdId)}
            />
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

  const formattedDate = BuildDisplayDate(data.publicationDate);
  const pubLine = [data.publisher, formattedDate].filter(Boolean).join(", ");
  const metaLine = [data.type, data.language, data.genre]
    .filter(Boolean)
    .join(", ");

  if (data.category === "equipment") {
    return (
      <div>
        <div className="text-xl font-bold">{data.title}</div>
      </div>
    );
  }

  return (
    <div className="inline">
      <div>
        <div className="text-xl font-bold">{data.title}</div>

        {creator ? (
          <div className="text-lg font-semibold text-sky-300">{creator}</div>
        ) : null}

        {pubLine ? <div>{pubLine}</div> : null}

        {metaLine ? (
          <div>
            {metaLine}
            {data.category === "audiovisualmedia" && data.runtime
              ? `, ${data.runtime} mins`
              : ""}
          </div>
        ) : null}

        {data.summary ? <div>{data.summary}</div> : null}
      </div>
    </div>
  );
}
