import { Link /*useNavigate*/ } from "react-router-dom";
import { FetchJson, WriteStoredAuth } from "../api";
import { useMessage } from "../hooks/useMessage";

export default function Login() {
  const { showSuccess, showWarning } = useMessage();

  // Standardized classes for the high-visibility theme
  const inputClasses =
    "mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400";

  const labelClasses =
    "block text-sm font-bold text-slate-700 uppercase tracking-wide mt-6 text-center";

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl bg-white p-10 shadow-sm border border-slate-200">
      <p className="font-bold tracking-[0.15em] text-sky-700">Welcome back!</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        Login
      </h1>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);

          const loginData = {
            email: formData.get("email"),
            password: formData.get("password"),
          };

          try {
            const data = await FetchJson("/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(loginData),
            });
            WriteStoredAuth({
              user: data.user,
              sessionToken: data.sessionToken,
              sessionExpiresAt: data.sessionExpiresAt,
            });
            showSuccess("Login successful!");
            setTimeout(() => {
              window.location.href = "/";
            }, 1500);
          } catch (error) {
            showWarning(error.message || "Login failed.");
          }
        }}
        className="w-full flex flex-col items-center"
      >
        <div className="w-full max-w-sm">
          <label htmlFor="email" className={labelClasses}>
            Email Address
          </label>
          <input
            required
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className={inputClasses}
          />

          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <input
            required
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className={inputClasses}
          />
        </div>

        <div className="mt-10 flex justify-center w-full">
          <button
            type="submit"
            className="w-full max-w-sm rounded-2xl bg-sky-700 px-4 py-3 font-bold text-white shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-3">
        <p className="text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/registration"
            className="font-bold text-sky-700 hover:text-sky-700 transition-colors"
          >
            Create one
          </Link>
        </p>
        <p className="text-sm text-slate-500 text-center">
          <Link
            to="/forgotpassword"
            Greenland
            className="font-bold text-sky-700/90 hover:text-sky-700 transition-colors underline"
          >
            Forgot your password?
          </Link>
        </p>
      </div>
    </section>
  );
}
