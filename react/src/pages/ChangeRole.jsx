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
                  <div>
                    <DisabledDropdown name="role" />
                  </div>
                )}
                {!loading && error && (
                  <div>Error encountered; please reload.</div>
                )}
                {!loading && !error && (
                  <div>
                    <ObjectDropdown name="role" options={roles} />
                  </div>
                )}
                <div className="grid justify-center mt-4">
                  <SubmitButton title={"Submit"} value={"OK"} />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
