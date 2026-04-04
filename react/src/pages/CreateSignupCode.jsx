import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SubmitButton } from "../components/Buttons";
import { useMessage } from "../hooks/useMessage";
import { FetchJson, ReadStoredUser } from "../api";


export default function CreateSignupCode() {
  const { showSuccess, showError } = useMessage();
  const navigate = useNavigate();
  const user = ReadStoredUser();
  const userKey = user
    ? `${user.user_type ?? ""}:${user.staff_id ?? ""}:${user.role ?? ""}`
    : "";

  useEffect(() => {
    const currentUser = ReadStoredUser();

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (currentUser.user_type !== "staff" || Number(currentUser.role) !== 2) {
      navigate("/", { replace: true });
    }
  }, [navigate, userKey]);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-xl shadow-slate-950/30 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Admin
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Create Signup Code
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
        Admin page for creating employee signup codes.
      </p>
      <p className="mt-4 mb-2 max-w-2xl text-base leading-7 text-slate-300">
        Create a signup code for staff or admin registration below:
      </p>

      <form
        className="w-full max-w-2xl"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);

          const signupCodeData = {
            signup_code: formData.get("signup_code"),
            staff_role_code: Number(formData.get("staff_role_code")),
          };

          try {
            await FetchJson("/api/staff-signup-codes", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(signupCodeData),
            });

            showSuccess("Signup code created successfully!");
            setTimeout(() => {
              window.location.reload();
            }, 800);
          } catch (error) {
            console.error(error);
            showError(error.message || "Failed to create signup code.");
          }
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="signup_code">
                Signup Code
              </label>
              <div className="mt-2">
                <input
                  required
                  id="signup_code"
                  name="signup_code"
                  type="text"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="staff_role_code">
                Staff Role
              </label>
              <div className="mt-2">
                <select
                  required
                  id="staff_role_code"
                  name="staff_role_code"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                >
                  <option value="1">
                    Staff
                  </option>
                  <option value="2">
                    Admin
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid justify-center">
            <SubmitButton title={"Create Code"} value={"OK"} />
          </div>
        </div>
      </form>
    </section>
  );
}
