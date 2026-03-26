import InputComponent from "../components/InputComponent";
import { SubmitButton } from "../components/Buttons";
import { FetchJson, GetErrorMessage } from "../api";
import { useEffect, useState } from "react";
import { ObjectDropdown, DisabledDropdown } from "../components/Dropdown";

export default function ChangeRole() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function LoadDropdowns() {
      try {
        setLoading(true);
        const rolesData = await FetchJson("/api/patronroles");
        setRoles(rolesData);
      } catch (err) {
        setError(GetErrorMessage(err, "Failed to load dropdowns."));
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    LoadDropdowns();
  }, []);

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          Staff
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Change Role
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Change patron roles with the below form.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        <form
          className="w-full"
          onSubmit={async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);

            const changeData = {
              patronId: formData.get("patronId"),
              role: formData.get("role"),
            };

            try {
              await FetchJson("/api/changerole", {
                method: "PUT",
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
            <div className="grid grid-cols-1 grid-rows-1 gap-x-6 ">
              <div className="grid grid-cols-6 gap-x-6">
                <InputComponent
                  colspan={3}
                  pattern="^[0-9]+$"
                  id="patronId"
                  label="Patron ID"
                />
                {loading && !error && (
                  <div className="col-span-2">
                    <DisabledDropdown name="role" />
                  </div>
                )}
                {!loading && error && (
                  <div className="col-span-2">
                    Error encountered; please reload.
                  </div>
                )}
                {!loading && !error && (
                  <div className="col-span-2">
                    <ObjectDropdown name="role" options={roles} />
                  </div>
                )}
                <div className="flex items-end w-full">
                  <SubmitButton
                    title={"Submit"}
                    value={"OK"}
                    fullwidth={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
