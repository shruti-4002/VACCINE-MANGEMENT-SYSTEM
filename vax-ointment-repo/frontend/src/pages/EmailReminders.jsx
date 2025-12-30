import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EmailReminders() {
  const [list, setList] = useState([]);

  const load = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/api/appointments/reminders/upcoming", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setList(data || []);
    } catch (err) {
      toast.error("Failed to load upcoming reminders");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Email Reminder Dashboard</h1>

      {list.length === 0 && <p>No appointments for tomorrow.</p>}

      <div className="space-y-4">
        {list.map((a) => (
          <div
            key={a._id}
            className="p-4 border rounded shadow bg-white"
          >
            <div className="font-semibold">{a.user?.name}</div>
            <div>{a.vaccine?.name}</div>
            <div>
              {new Date(a.date).toLocaleDateString()} at {a.time}
            </div>
            <div className="text-sm text-gray-500">
              Email: {a.user?.email}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
