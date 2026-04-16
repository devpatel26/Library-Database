import { SubmitButton } from "../components/Buttons";
import { FetchJson } from "../api";
import { useMessage } from "../hooks/useMessage";

export default function StaffRegistration() {
  const { showSuccess, showError } = useMessage();

  // Standardized classes for light-mode visibility
  const inputClasses = 
    "block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400";
  
  const labelClasses = 
    "block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 text-left";

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-600">
        Internal System
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        Staff Registration
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Create a new employee account using an authorized signup code.
      </p>
      
      <form
        className="w-full mt-10"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);

          const staffData = {
            firstname: formData.get("firstname"),
            lastname: formData.get("lastname"),
            birthday: formData.get("birthday"),
            email: formData.get("email"),
            password: formData.get("password"),
            phone_number: formData.get("phonenumber"),
            address: formData.get("address"),
            signup_code: formData.get("signup_code"),
          };

          try {
            await FetchJson("/api/staff/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(staffData),
            });

            showSuccess("Staff registration successful!");
            e.target.reset();
          } catch (error) {
            showError(error.message || "Registration failed.");
          }
        }}
      >
        <div className="space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="firstname" className={labelClasses}>First Name</label>
              <input required id="firstname" name="firstname" type="text" placeholder="Jane" className={inputClasses} />
            </div>
            <div>
              <label htmlFor="lastname" className={labelClasses}>Last Name</label>
              <input required id="lastname" name="lastname" type="text" placeholder="Doe" className={inputClasses} />
            </div>
            <div>
              <label htmlFor="birthday" className={labelClasses}>Date of Birth</label>
              <input required id="birthday" name="birthday" type="date" className={inputClasses} />
            </div>
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="address" className={labelClasses}>Residential Address</label>
              <input required id="address" name="address" type="text" placeholder="123 Library Way, City, State" className={inputClasses} />
            </div>
            <div>
              <label htmlFor="phonenumber" className={labelClasses}>Phone Number</label>
              <input required id="phonenumber" name="phonenumber" type="tel" placeholder="555-0123" className={inputClasses} />
            </div>
          </div>

          {/* Credentials Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClasses}>Email Address</label>
              <input required id="email" name="email" type="email" placeholder="staff@library.org" className={inputClasses} />
            </div>
            <div>
              <label htmlFor="password" className={labelClasses}>Password</label>
              <input required id="password" name="password" type="password" placeholder="••••••••" className={inputClasses} />
            </div>
          </div>

          {/* Verification Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-end pt-4">
            <div className="sm:col-span-1">
              <label htmlFor="signup_code" className={labelClasses}>Signup Code</label>
              <input 
                required 
                id="signup_code" 
                name="signup_code" 
                type="text" 
                placeholder="STAFF-2024"
                className={`${inputClasses} border-sky-200 bg-sky-50/30`} 
              />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton title={"Complete Registration"} value={"OK"} fullwidth={true} />
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}