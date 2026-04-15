import { SubmitButton } from "../components/Buttons";
import { useMessage } from "../hooks/useMessage";
import { FetchJson } from "../api";

export default function Equipment() {
  const { showSuccess, showError } = useMessage();
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <h2 className="text-3xl font-bold text-white">
        Equipment Entry
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Enter equipment information below.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Image upload is not enabled for equipment yet.
      </p>
      <div className="flex gap-4 flex-wrap justify-evenly mt-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const equipmentData = {
              title: formData.get("title"),
              available: formData.get("available"),
            };

            try {
              await FetchJson("/api/itementry/equipment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(equipmentData),
              });

              showSuccess("Equipment entry successful!");
              setTimeout(() => {
                window.location.reload();
              }, 800);
            } catch (error) {
              console.error(error);
              showError(error.message || "Equipment entry failed.");
            }
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-x-6 ">
              <div className="col-span-2">
                <label htmlFor="title">
                  Equipment Name
                </label>
                <div className="mt-2">
                  <input
                    required
                    id="title"
                    name="title"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="available">
                  Copies
                </label>
                <div className="mt-2">
                  <input
                    required
                    type="number"
                    id="available"
                    name="available"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className=" flex items-end w-full">
                <SubmitButton title={"Submit"} value={"OK"} fullwidth={true} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
