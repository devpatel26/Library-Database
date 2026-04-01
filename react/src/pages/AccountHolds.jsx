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

      <h1 className="text-3xl font-semibold text-white">
        My Holds
      </h1>

      <div className="rounded-xl bg-slate-900 border border-slate-700">

        <table className="w-full text-sm">

          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-3 text-left">Hold ID</th>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-left">Creator</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">Expire</th>
            </tr>
          </thead>

          <tbody>

            {holds.map((h) => (
              <tr key={h.holdId} className="border-t border-slate-700">

                <td className="p-3">{h.holdId}</td>
                <td className="p-3">{h.title}</td>
                <td className="p-3">{h.creator}</td>
                <td className="p-3">{h.holdStart}</td>
                <td className="p-3">{h.holdEnd}</td>

              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}