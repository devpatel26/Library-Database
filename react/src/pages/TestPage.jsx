import TestComponentNoData from "../components/TestComponentNoData";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import Item, { ItemHold, ItemLoan, ItemStaff } from "../components/Items";
import Fine, { FineStaff } from "../components/Fine";
import dummyFines from "../data/dummy/fines";
import dummyBaseItemsPatron, { dummyBaseItemsStaff } from "../data/dummy/items";
import InputComponent from "../components/InputComponent";

// import { FetchJson, GetErrorMessage } from "../api";
// import { useEffect, useState } from "react";
// import { ObjectDropdown, DisabledDropdown } from "../components/Dropdown";

export default function TestPage() {
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");
  // useEffect(() => {
  //   async function LoadDropdowns() {
  //     try {
  //       setLoading(true);
  //       const roleData = await FetchJson("/api/patronroles");
  //       setFormat(roleData);
  //     } catch (err) {
  //       setError(GetErrorMessage(err, "Failed to load dropdowns."));
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   LoadDropdowns();
  // }, []);

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
      {/* TESTING FOR ROLE CHANGING BEGIN */}

      {/* <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        <form
          className="w-full"
          onSubmit={async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);

            const changeData = {
              patronId: formData.get("patronId"),
              summary: formData.get("summary"),
            };

            try {
              await FetchJson("/api/changerole", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(changeData),
              });

              alert("Patron role change successful!");
              e.target.reset();
            } catch (error) {
              console.error(error);
              alert(error.message || "Patron role change failed.");
            }
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 grid-rows-6 gap-x-6 ">
              <div className="grid grid-cols-4 gap-x-6">
                <InputComponent
                  colspan={2}
                  pattern="(?=.*\S)[\s\S]{1,45}"
                  id="patronId"
                  label="Patron ID"
                  min={1}
                  max={45}
                />
                {loading && !error && (
                  <div className="grid grid-cols-3 gap-x-6">
                    <DisabledDropdown name="roles" />
                  </div>
                )}
                {!loading && error && (
                  <div className="grid grid-cols-3 gap-x-6">
                    Error encountered; please reload.
                  </div>
                )}
                {!loading && !error && (
                  <div className="grid grid-cols-3 gap-x-6">
                    <ObjectDropdown name="roles" options={roles} />
                  </div>
                )}
                <div className="grid justify-center mt-4">
                  <SubmitButton title={"Submit"} value={"OK"} />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div> */}
      {/* TESTING FOR ROLE CHANGING END */}
    </div>
  );
}
