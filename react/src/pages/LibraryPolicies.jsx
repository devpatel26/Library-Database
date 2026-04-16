import React from "react";

const LibraryPolicies = () => {
  const policies = [
    {
      title: "Borrowing & Renewals",
      icon: (
        <svg
          className="w-7 h-7 text-sky-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
      ),
      description: `All patrons are able to borrow items from Datahaven Library. The standard borrowing period is 14 days, while students and faculty have 21-day and 28-day periods respectively. Renewals are not offered at the moment; items may be re-checked out as long as there is no active hold for the item.`,
    },
    {
      title: "Fines & Lost Items",
      icon: (
        <svg
          className="w-7 h-7 text-sky-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
      description: `Overdue items will garner fines daily. Patrons receive a 0.25$ per day, students receive a 0.20$ fine per day, and faculty receive a 0.10$ fine per day the item overdue. Items overdue by more than 30 days are marked as "Lost," and a $25 fine will be issued for the replacement cost. Fines can be paid in person or online. Patrons with unpaid fines of over $10 will be unable to place new holds or check out items.`,
    },
    {
      title: "Code of Conduct",
      icon: (
        <svg
          className="w-7 h-7 text-sky-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
          />
        </svg>
      ),
      description:
        "Covered beverages and food are permitted in the library, but are not allowed at the computer tables. Please use headphones when applicable and keep conversations at a respectful volume.",
    },
    {
      title: "Privacy",
      icon: (
        <svg
          className="w-7 h-7 text-sky-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      ),
      description:
        "Patron activites, such as fine, loan, and holding activity is tracked and available through the account history page.",
    },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-sky-200/50 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Header Section */}
      <div className="relative text-center mb-16 mt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Library{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-blue-900">
            Policies
          </span>
        </h1>
        <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
          These guidelines help us maintain a safe, equitable, and welcoming
          environment for all Datahaven patrons.
        </p>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {policies.map((policy, index) => (
          <div
            key={index}
            className="group bg-white border border-slate-100 p-8 rounded-3xl hover:bg-slate-50 hover:border-sky-200 transition-all duration-500 flex flex-col shadow-xl shadow-slate-200/50"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-100 transition-all duration-500">
              {policy.icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-wide group-hover:text-sky-700 transition-colors">
              {policy.title}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              {policy.description}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center relative z-10">
        <p className="text-sm text-slate-600 bg-slate-50 inline-block px-6 py-3 rounded-full border border-slate-200 shadow-sm">
          Have a question not covered here? Feel free to ask our staff at the
          front desk.
        </p>
      </div>
    </div>
  );
};

export default LibraryPolicies;
