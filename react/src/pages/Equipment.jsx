import { SubmitButton } from "../components/Buttons";
import { useMessage } from "../hooks/useMessage";
import { FetchJson } from "../api";

export default function Equipment() {
  const { showSuccess, showError } = useMessage();
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-bold text-slate-900">
        Equipment Entry
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Enter equipment information below.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-slate-400 italic">
        Image upload is not enabled for equipment yet.
      </p>
      <div className="flex gap-4 flex-wrap justify-evenly mt-6">
        <form
          className="w-full"
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
            <div className="grid grid-cols-4 gap-x-6">
              <div className="col-span-2">
                <label htmlFor="title" className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Equipment Name
                </label>
                <div>
                  <input
                    required
                    id="title"
                    name="title"
                    placeholder="e.g. Sony Camera"
                    className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="available" className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Copies
                </label>
                <div>
                  <input
                    required
                    type="number"
                    id="available"
                    name="available"
                    placeholder="0"
                    className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-end w-full">
                <SubmitButton title={"Submit"} value={"OK"} fullwidth={true} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}