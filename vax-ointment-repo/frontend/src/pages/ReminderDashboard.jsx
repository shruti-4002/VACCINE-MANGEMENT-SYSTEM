import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API, { getUpcomingReminders } from "../api";

export default function ReminderDashboard() {
  const [list, setList] = useState([]);
  const [mode, setMode] = useState("7days"); // "7days" | "all" | "3days" etc.

  const load = async () => {
    try {
      let data;
      if (mode === "all") {
        data = await getUpcomingReminders({ all: true });
      } else {
        // parse days from mode string, default 7
        const days = mode.endsWith("days") ? Number(mode.replace("days", "")) || 7 : 7;
        data = await getUpcomingReminders({ days });
      }
      setList(data || []);
    } catch (err) {
      console.error("Load reminders error:", err);
      toast.error("Failed to load upcoming reminders");
    }
  };

  const sendReminder = async (id) => {
    try {
      const res = await API.post("/appointments/reminders/send", { appointmentId: id });
      toast.success(res?.message || "Reminder Sent");
    } catch (err) {
      console.error("Send reminder error:", err);
      const msg = err?.response?.data?.message || "Failed to send reminder";
      toast.error(msg);
    }
  };

  useEffect(() => {
    load();
  }, [mode]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Email Reminder Dashboard</h1>

        <div className="flex gap-2">
          <button onClick={() => setMode("1days")} className={`px-3 py-2 rounded ${mode==="1days" ? "bg-blue-600 text-white" : "bg-white border"}`}>Tomorrow</button>
          <button onClick={() => setMode("7days")} className={`px-3 py-2 rounded ${mode==="7days" ? "bg-blue-600 text-white" : "bg-white border"}`}>Next 7 days</button>
          <button onClick={() => setMode("30days")} className={`px-3 py-2 rounded ${mode==="30days" ? "bg-blue-600 text-white" : "bg-white border"}`}>30 days</button>
          <button onClick={() => setMode("all")} className={`px-3 py-2 rounded ${mode==="all" ? "bg-blue-600 text-white" : "bg-white border"}`}>All future</button>
        </div>
      </div>

      {list.length === 0 && <p>No upcoming appointments found.</p>}

      <div className="space-y-4">
        {list.map((a) => (
          <div key={a._id} className="p-4 border rounded shadow flex justify-between">
            <div>
              <p className="font-semibold">{a.user?.name || "User"}</p>
              <p>{a.vaccine?.name}</p>
              <p>{new Date(a.date).toLocaleDateString()} at {a.time}</p>
            </div>

            <button onClick={() => sendReminder(a._id)} className="px-3 py-2 bg-blue-600 text-white rounded">
              Send Reminder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
