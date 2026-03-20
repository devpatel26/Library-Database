import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center shadow-xl shadow-slate-950/30">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
        Login
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        Login
      </h1>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          console.log("form submitted");

          const formData = new FormData(e.target);

          const loginData = {
            email: formData.get("email"),
            password: formData.get("password"),
          };

          console.log("loginData:", loginData);

          try {
            const response = await fetch("/api/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(loginData),
            });

            const data = await response.json();
            console.log("response data:", data);

            if (!response.ok) {
              throw new Error(data.error || "Login failed.");
            }

            alert("Login successful!");
            navigate("/account");
          } catch (error) {
            console.error("login error:", error);
            alert(error.message || "Login failed.");
          }
        }}
        className="w-full flex flex-col items-center"
      >
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Email
        </p>
        <input
          required
          id="email"
          name="email"
          type="email"
          className="block w-full max-w-md rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
        />

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Password
        </p>
        <input
          required
          id="password"
          name="password"
          type="password"
          className="block w-full max-w-md rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
        />

        <div className="grid justify-center pt-6">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            Login
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Don't have an account?{" "}
        <Link to="/registration" className="text-sky-300 hover:text-sky-200">
          Register
        </Link>
      </p>
      
      <p className="mt-4 text-sm text-slate-400">
        Staff registration?{" "}
        <Link to="/staffregistration" className="text-sky-300 hover:text-sky-200">
          Register
        </Link>
      </p>
      <p className="mt-4 text-sm text-slate-400">
        Forgot your password?{" "}
        <Link to="/forgotpassword" className="text-sky-300 hover:text-sky-200">
          Reset it
        </Link>
      </p>
    </section>
  );
}