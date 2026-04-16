import React, { useEffect, useState } from "react";

export default function AccountHolds() {
  const [holds, setHolds] = useState([]);

  useEffect(() => {
    fetch("/api/loans", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setHolds(data.holds || []);
      });
  }, []);

  return (
    <div className="space-y-6">

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        My Holds
      </h1>

      {/* Added overflow-hidden so the table headers respect the rounded corners */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <table className="w-full text-sm text-left">

          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold">
                Hold ID
              </th>
              <th className="p-4 font-semibold">
                Item
              </th>
              <th className="p-4 font-semibold">
                Creator
              </th>
              <th className="p-4 font-semibold">
                Start
              </th>
              <th className="p-4 font-semibold">
                Expire
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">

            {holds.map((h) => (
              <tr key={h.holdId} className="hover:bg-slate-50 transition-colors text-slate-600">

                <td className="p-4 font-medium text-[#244c5a]">{h.holdId}</td>
                <td className="p-4 font-medium text-slate-900">{h.title}</td>
                <td className="p-4">{h.creator}</td>
                <td className="p-4">{h.holdStart}</td>
                <td className="p-4">{h.holdEnd}</td>

              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}