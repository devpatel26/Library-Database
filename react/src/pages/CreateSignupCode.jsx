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

  // Standardized classes for the high-visibility theme
  const inputClasses = 
    "block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400";
  
  const labelClasses = 
    "block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 text-left";

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
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-600">
        Admin Portal
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        Create Signup Code
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Generate unique codes to authorize new staff or administrator accounts.
      </p>

      <form
        className="w-full max-w-2xl mt-10"
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
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(signupCodeData),
            });

            showSuccess("Signup code created successfully!");
            setTimeout(() => { window.location.reload(); }, 800);
          } catch (error) {
            showError(error.message || "Failed to create signup code.");
          }
        }}
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
            {/* Signup Code Input */}
            <div className="sm:col-span-3">
              <label htmlFor="signup_code" className={labelClasses}>
                New Signup Code
              </label>
              <input
                required
                id="signup_code"
                name="signup_code"
                type="text"
                placeholder="e.g. STAFF_2024_ABC"
                className={inputClasses}
              />
            </div>

            {/* Role Selection Dropdown */}
            <div className="sm:col-span-3">
              <label htmlFor="staff_role_code" className={labelClasses}>
                Assign Staff Role
              </label>
              <select
                required
                id="staff_role_code"
                name="staff_role_code"
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="1">Staff (General Access)</option>
                <option value="2">Admin (System Manager)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <SubmitButton title={"Generate Code"} value={"OK"} halfwidth={true} />
          </div>
        </div>
      </form>
      
      <div className="mt-12 rounded-2xl bg-slate-50 p-6 border border-slate-100 text-left">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Security Note</h4>
        <p className="mt-1 text-sm text-slate-500">
          Created codes are valid for one-time use. Ensure you share these only with authorized personnel via secure channels.
        </p>
      </div>
    </section>
  );
}