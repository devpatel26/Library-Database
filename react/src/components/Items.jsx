import { useEffect, useState } from "react";
import PrimaryButton, { SecondaryButton } from "./Buttons";
import { FetchJson, ReadStoredUser } from "../api";
import { FormatDate } from "./TimeFormats";
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

const itemImageThemes = {
  book: {
    label: "BOOK",
    start: "#0369a1",
    end: "#075985",
    accent: "#bae6fd",
  },
  periodical: {
    label: "PRESS",
    start: "#0f766e",
    end: "#134e4a",
    accent: "#99f6e4",
  },
  audiovisualmedia: {
    label: "MEDIA",
    start: "#7e22ce",
    end: "#581c87",
    accent: "#e9d5ff",
  },
  equipment: {
    label: "GEAR",
    start: "#3f3f46",
    end: "#18181b",
    accent: "#e4e4e7",
  },
  default: {
    label: "ITEM",
    start: "#334155",
    end: "#1e293b",
    accent: "#f1f5f9",
  },
};

function EscapeSvgText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function NormalizeImageSource(value) {
  const normalizedValue = String(value ?? "").trim();
  return normalizedValue === "" ? null : normalizedValue;
}

function BuildFallbackImageSource(itemData) {
  const theme = itemImageThemes[itemData?.category] ?? itemImageThemes.default;
  const label = EscapeSvgText(theme.label);
  const title =
    EscapeSvgText(
      String(itemData?.title ?? theme.label)
        .trim()
        .slice(0, 12)
        .toUpperCase(),
    ) + (itemData?.title.length > 12 ? "..." : "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="item-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.start}" />
          <stop offset="100%" stop-color="${theme.end}" />
        </linearGradient>
      </defs>
      <rect width="240" height="320" rx="28" fill="url(#item-gradient)" />
      <rect x="16" y="16" width="208" height="288" rx="20" fill="#ffffff" opacity="0.1" />
      <circle cx="188" cy="62" r="26" fill="${theme.accent}" opacity="0.85" />
      <path d="M0 245 C48 220 92 204 140 218 C182 230 210 254 240 274 L240 320 L0 320 Z" fill="${theme.accent}" opacity="0.28" />
      <rect x="32" y="38" width="84" height="96" rx="16" fill="#ffffff" opacity="0.14" />
      <text x="32" y="182" fill="#ffffff" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="2">${label}</text>
      <text x="32" y="214" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="700">${title}</text>
      <text x="32" y="244" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" letter-spacing="3" opacity="0.7">DATAHAVEN LIBRARY</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function ItemImage({
  itemData,
  className = "h-48 w-36 shrink-0 rounded-2xl object-cover border border-slate-200 shadow-sm",
}) {
  const fallbackSource = BuildFallbackImageSource(itemData);
  const resolvedSource =
    NormalizeImageSource(itemData?.coverImageUrl) ?? fallbackSource;
  const [source, setSource] = useState(resolvedSource);

  useEffect(() => {
    setSource(resolvedSource);
  }, [resolvedSource]);

  return (
    <img
      src={source}
      alt={`${String(itemData?.title ?? "Library item")} cover`}
      className={className}
      loading="lazy"
      onError={() => {
        if (source !== fallbackSource) {
          setSource(fallbackSource);
        }
      }}
    />
  );
}

export default function Item({ itemData }) {
  const user = ReadStoredUser();
  const { showSuccess, showError, showWarning } = useMessage();

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
      <div className="grid grid-cols-4 rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="col-span-3 flex gap-6">
          <ItemImage itemData={itemData} />
          <ItemHolder data={itemData} />
        </div>

        <div className="col-span-1 grid grid-rows-2 items-center border-l border-slate-100 pl-6">
          <div className="grid grid-cols-3 grid-rows-2 text-center text-[11px] font-bold uppercase tracking-tight text-slate-500">
            <span>
              <span className="text-slate-500">Available</span>
              <span className="text-slate-900 text-base">
                {itemData.available}
              </span>
            </span>

            <span>
              <span className="text-slate-500">Reserved</span>
              <span className="text-slate-900 text-base">
                {itemData.reservedCount ?? 0}
              </span>
            </span>

            <span>
              <span className="text-slate-500">Queue</span>
              <span className="text-slate-900 text-base">
                {itemData.queueCount ?? 0}
              </span>
            </span>

            <span>
              <span className="text-slate-500">Unavailable</span>
              <span className="text-slate-900 text-base">
                {itemData.unavailable}
              </span>
            </span>

            {itemData.category !== "equipment" ? (
              <span>
                <span className="text-slate-500">Shelf</span>
                <span className="text-slate-900 text-base">
                  {itemData.shelfNumber}
                </span>
              </span>
            ) : null}
          </div>

          <div className="grid h-full justify-items-center gap-2 pt-4">
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
                    <div className="mt-2 flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-4 border border-slate-200 shadow-inner">
                      <div className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">
                        {activeStaffAction === "hold"
                          ? "Enter hold patron ID"
                          : "Enter checkout patron ID"}
                      </div>

                      <input
                        type="number"
                        min="1"
                        value={patronIdInput}
                        onChange={(event) =>
                          setPatronIdInput(event.target.value)
                        }
                        placeholder="Patron ID"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                      />

                      <div className="flex gap-2">
                        <PrimaryButton
                          title={isSubmitting ? "..." : "Confirm"}
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
              <SecondaryButton title="Removed" disabled={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CarouselItem({ itemData }) {
  const user = ReadStoredUser();
  const { showSuccess, showError, showWarning } = useMessage();

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
    <div className="w-70">
      {itemData.category != "equipment" ? (
        <div className="h-full grid grid-rows-4 rounded-3xl bg-white border border-slate-200 p-4 transition transform hover:-translate-y-1 hover:shadow-md">
          <div className="row-span-4 m-2">
            <CarouselItemHolder data={itemData} />
          </div>
          <div className="row-span-1 grid grid-cols-1 grid items-center text-center">
            <div className="grid grid-cols-2 text-xs font-bold uppercase tracking-widest mb-2">
              <span
                className={
                  itemData.available >= 1 ? "text-green-700" : "text-red-600"
                }
              >
                {itemData.available >= 1 ? "Available" : "Not Available"}
              </span>
              <span className="text-slate-500">
                Shelf: {itemData.shelfNumber}
              </span>
            </div>
            {canPlaceHold ? (
              isStaff ? (
                <>
                  {itemData.available >= 1 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <PrimaryButton
                        title="Place Hold"
                        onClick={() => OpenStaffAction("hold")}
                      />

                      <PrimaryButton
                        title="Check Out"
                        onClick={() => OpenStaffAction("checkout")}
                      />
                    </div>
                  ) : (
                    <SecondaryButton title="Unavailable" disabled={true} />
                  )}

                  {activeStaffAction ? (
                    <div className="mt-2 flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-3 border border-slate-200">
                      <div className="text-xs font-bold text-sky-700 uppercase">
                        Patron ID
                      </div>

                      <input
                        type="number"
                        min="1"
                        value={patronIdInput}
                        onChange={(event) =>
                          setPatronIdInput(event.target.value)
                        }
                        placeholder="ID"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                      />

                      <div className="flex gap-2">
                        <PrimaryButton
                          title={
                            isSubmitting
                              ? "..."
                              : activeStaffAction == "checkout"
                                ? "Loan"
                                : "Hold"
                          }
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
                <>
                  {itemData.available >= 1 ? (
                    <PrimaryButton
                      title="Place Hold"
                      onClick={HandlePatronHold}
                      disabledValue={isSubmitting}
                    />
                  ) : (
                    <SecondaryButton title="Unavailable" disabled={true} />
                  )}
                </>
              )
            ) : (
              <SecondaryButton title="Unavailable" disabled={true} />
            )}
          </div>
        </div>
      ) : (
        <div className="h-full grid grid-rows-4 rounded-3xl bg-white border border-slate-200 p-4 transition transform hover:-translate-y-1 hover:shadow-md">
          <div className="row-span-4 m-2">
            <CarouselItemHolder data={itemData} />
          </div>
          <div className="row-span-1 grid grid-cols-1 grid items-center text-center">
            <div className="grid grid-cols-1 text-xs font-bold uppercase tracking-widest mb-2">
              <span
                className={
                  itemData.available >= 1 ? "text-green-700" : "text-red-600"
                }
              >
                {itemData.available >= 1 ? "Available" : "Not Available"}
              </span>
            </div>
            {canPlaceHold ? (
              isStaff ? (
                <>
                  {itemData.available >= 1 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <PrimaryButton
                        title="Place Hold"
                        onClick={() => OpenStaffAction("hold")}
                      />

                      <PrimaryButton
                        title="Check Out"
                        onClick={() => OpenStaffAction("checkout")}
                      />
                    </div>
                  ) : (
                    <SecondaryButton title="Unavailable" disabled={true} />
                  )}

                  {activeStaffAction ? (
                    <div className="mt-2 flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-3 border border-slate-200">
                      <div className="text-sm font-bold text-sky-700 uppercase">
                        Patron ID
                      </div>

                      <input
                        type="number"
                        min="1"
                        value={patronIdInput}
                        onChange={(event) =>
                          setPatronIdInput(event.target.value)
                        }
                        placeholder="ID"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                      />

                      <div className="flex gap-2">
                        <PrimaryButton
                          title={
                            isSubmitting
                              ? "..."
                              : activeStaffAction == "checkout"
                                ? "Loan"
                                : "Hold"
                          }
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
                <>
                  {itemData.available >= 1 ? (
                    <PrimaryButton
                      title="Place Hold"
                      onClick={HandlePatronHold}
                      disabledValue={isSubmitting}
                    />
                  ) : (
                    <SecondaryButton title="Unavailable" disabled={true} />
                  )}
                </>
              )
            ) : (
              <SecondaryButton title="Unavailable" disabled={true} />
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
  const metaLine = [data.type, data.language, data.genre]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <ItemImage
        itemData={data}
        className="h-52 w-36 rounded-2xl object-cover shadow-md mb-4 border border-slate-100"
      />
      <div className="text-lg font-bold text-slate-900 leading-tight">
        {data.title}
      </div>

      {creator ? (
        <div className="text-sm font-bold text-sky-700 mt-1 uppercase tracking-wide">
          {creator}
        </div>
      ) : null}

      {metaLine ? (
        <div className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-widest">
          {metaLine}
          {data.category === "audiovisualmedia" && data.runtime
            ? `, ${data.runtime} MINS`
            : ""}
        </div>
      ) : null}

      {data.summary ? (
        data.summary.length > 120 ? (
          <div className="text-sm text-slate-600 mt-2 mb-2 leading-relaxed">
            {data.summary.slice(0, 120)}...
          </div>
        ) : (
          <div className="text-sm text-slate-600 mt-2 mb-2 leading-relaxed">
            {data.summary}
          </div>
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
    <div className="w-full">
      <div className="grid grid-cols-4 rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="col-span-3 flex gap-6">
          <ItemImage itemData={itemData} />
          <ItemHolder data={itemData} />
        </div>

        <div className="col-span-1 grid grid-cols-2 items-center border-l border-slate-100 pl-6">
          {itemData.status === "Available" ? (
            <div className="grid grid-rows-2 col-span-1 text-sm text-slate-600">
              <div>
                Copy:{" "}
                <span className="font-bold text-slate-900">
                  {itemData.copy}
                </span>
              </div>
              <div>
                Status:{" "}
                <span className="font-bold text-slate-900">
                  {itemData.status}
                </span>
              </div>
            </div>
          ) : itemData.status === "On hold" ? (
            <div className="grid grid-rows-4 col-span-1 text-sm text-slate-600">
              <div>
                Copy:{" "}
                <span className="font-bold text-slate-900">
                  {itemData.copy}
                </span>
              </div>
              <div>
                Status:{" "}
                <span className="font-bold text-slate-900">
                  {itemData.status}
                </span>
              </div>
              <div className="text-xs italic mt-1">Held until {holdEnd}</div>
              <div className="text-xs">
                By {itemData.userId ?? itemData.userid}
              </div>
            </div>
          ) : itemData.status === "Loaned" ? (
            <div className="grid grid-rows-4 col-span-1 text-sm text-slate-600">
              <div>
                Copy:{" "}
                <span className="font-bold text-slate-900">
                  {itemData.copy}
                </span>
              </div>
              <div>
                Status:{" "}
                <span className="font-bold text-slate-900">
                  {itemData.status}
                </span>
              </div>
              <div className="text-xs italic mt-1">Due {loanEnd}</div>
              <div className="text-xs">
                To {itemData.userId ?? itemData.userid}
              </div>
            </div>
          ) : (
            <div className="grid grid-rows-2 col-span-1 text-sm text-slate-600">
              <div>
                Copy:{" "}
                <span className="font-bold text-slate-900">
                  {itemData.copy}
                </span>
              </div>
              <div>
                Status:{" "}
                <span className="font-bold text-slate-900">
                  {itemData.status}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-1 items-center justify-items-center text-center p-2 flex flex-col justify-center">
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
                title="Mark returned"
                onClick={() => onMarkReturned?.(itemData.loanId)}
              />
              <SecondaryButton
                title="Mark missing"
                onClick={() => onMarkMissing?.(itemData.loanId)}
              />
            </div>
          ) : itemData.status === "Available" ? (
            <SecondaryButton
              title="Mark missing"
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
      <div className="grid grid-cols-4 rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="col-span-3 flex gap-6">
          <ItemImage itemData={itemData} />
          <ItemHolder data={itemData} />
        </div>

        {itemData.overdue ? (
          <div className="col-span-1 grid grid-rows-2 items-center text-center border-l border-slate-100 pl-6">
            <div className="text-sm font-medium text-slate-600">
              Due:{" "}
              <span className="font-bold text-slate-900">{formattedDate}</span>
            </div>
            <div className="font-bold text-red-600 bg-red-60 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
              Overdue
            </div>
          </div>
        ) : (
          <div className="col-span-1 grid grid-rows-2 items-center text-center border-l border-slate-100 pl-6">
            <div className="text-sm font-medium text-slate-600">
              Due:{" "}
              <span className="font-bold text-slate-900">{formattedDate}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ItemHold({ itemData, onCancel }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-4 rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="col-span-3 flex gap-6">
          <ItemImage itemData={itemData} />
          <ItemHolder data={itemData} />
        </div>

        {itemData.ready ? (
          <div className="col-span-1 grid grid-rows-2 items-center text-center border-l border-slate-100 pl-6 gap-2">
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Ready for pickup
            </span>
            <PrimaryButton
              title="Cancel"
              disabledValue={!onCancel}
              onClick={() => onCancel?.(itemData.holdId)}
            />
          </div>
        ) : (
          <div className="col-span-1 grid grid-rows-2 items-center text-center border-l border-slate-100 pl-6 gap-2">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">
              In queue
            </span>
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
      <div className="flex flex-col justify-center">
        <div className="text-2xl font-bold text-slate-900">{data.title}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex-1">
        <div className="text-2xl font-bold text-slate-900 leading-tight">
          {data.title}
        </div>

        {creator ? (
          <div className="text-lg font-medium mt-1">
            by <span className="text-sky-800">{creator}</span>
          </div>
        ) : null}

        <div className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          {metaLine}
          {data.category === "audiovisualmedia" && data.runtime
            ? ` • ${data.runtime} MINS`
            : ""}
        </div>

        {pubLine ? (
          <div className="text-xs font-medium text-slate-500 mt-1">
            {pubLine}
          </div>
        ) : null}
      </div>

      {data.summary ? (
        <div className="text-sm text-slate-600 mt-4 leading-relaxed line-clamp-3 max-w-xl flex-1">
          {data.summary}
        </div>
      ) : null}
    </div>
  );
}
