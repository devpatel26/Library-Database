import { SubmitButton } from "../components/Buttons";
import { FetchJson } from "../api";
import { useMessage } from "../hooks/useMessage";
import { Link } from "react-router-dom";

export default function Registration() {
  const { showSuccess, showError } = useMessage();

  // Standardized classes for the high-visibility light theme
  const inputClasses =
    "block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400";

  const labelClasses =
    "block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 text-left";

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-700">
        Membership
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        Create Account
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Join our library community to borrow items, manage holds, and access
        digital resources.
      </p>

      <form
        className="w-full mt-10"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);

          const registrationData = {
            firstname: formData.get("firstname"),
            lastname: formData.get("lastname"),
            birthday: formData.get("birthday"),
            email: formData.get("email"),
            password: formData.get("password"),
          };

          try {
            await FetchJson("/api/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(registrationData),
            });

            showSuccess("Registration successful! Please sign in.");
            e.target.reset();
          } catch (error) {
            showError(error.message || "Registration failed.");
          }
        }}
      >
        <div className="space-y-6">
          {/* Name & Birthday Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="firstname" className={labelClasses}>
                First Name
              </label>
              <input
                required
                id="firstname"
                name="firstname"
                type="text"
                placeholder="Jane"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="lastname" className={labelClasses}>
                Last Name
              </label>
              <input
                required
                id="lastname"
                name="lastname"
                type="text"
                placeholder="Doe"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="birthday" className={labelClasses}>
                Date of Birth
              </label>
              <input
                required
                id="birthday"
                name="birthday"
                type="date"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Credentials Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClasses}>
                Email Address
              </label>
              <input
                required
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClasses}>
                Password
              </label>
              <input
                required
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="flex flex-col items-center pt-6">
            <SubmitButton
              title={"Register Account"}
              value={"OK"}
              halfwidth={true}
            />

            <p className="mt-8 text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-sky-700 hover:text-sky-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </form>
    </section>
  );
}
