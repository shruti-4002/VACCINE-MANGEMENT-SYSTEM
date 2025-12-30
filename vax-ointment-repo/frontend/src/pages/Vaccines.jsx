// src/pages/Vaccines.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getVaccines } from "../api";

export default function Vaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getVaccines(); // uses API.create axios instance
      setVaccines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load vaccines", err);
      toast.error("Failed to load vaccines");
      setVaccines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = vaccines.filter((v) =>
    v.name.toLowerCase().includes(q.toLowerCase())
  );

  function prettyDate(d) {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      // if invalid date, return raw value
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Vaccine Availability</h1>
        <div className="flex gap-3 items-center">
        </div>
      </div>

      <div className="mb-6">
        <input
          type="search"
          placeholder="Search vaccine..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full md:w-1/3 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {loading && vaccines.length === 0 ? (
        <div className="text-gray-500">Loading vaccines…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No vaccines match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <div
              key={v._id || v.id || v.name}
              className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{v.name}</h2>

                  <div className="mt-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-800">Qty:</span>{" "}
                      {v.quantity ?? v.qty ?? v.stock ?? 0}
                    </div>
                    <div className="mt-1">
                      <span className="font-medium text-gray-800">Expiry:</span>{" "}
                      {prettyDate(v.expiry ?? v.expiresAt ?? v.expiryDate)}
                    </div>
                    {v.note && (
                      <div className="mt-2 text-sm text-gray-500">{v.note}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
