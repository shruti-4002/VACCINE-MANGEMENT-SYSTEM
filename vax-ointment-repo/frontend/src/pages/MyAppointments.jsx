import React, { useEffect, useState } from "react";
import { fetchMyAppointments } from "../api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function MyAppointments() {

  // 🚨 BLOCK ADMIN FROM ENTERING THIS PAGE
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "admin") {
      toast.error("Admins cannot access User Appointments");
      window.location.href = "/dashboard"; // redirect admin
    }
  }, []);

  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // ✅ LOAD APPOINTMENTS
  const load = async () => {
    try {
      const res = await fetchMyAppointments();
      setList(res || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load appointments");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ FILTER LOGIC
  const filtered = list.filter((a) => {
    const apptDate = new Date(a.date);
    const now = new Date();

    if (filter === "past") return apptDate < now;
    if (filter === "upcoming") return apptDate >= now;
    return true;
  });

  // ✅ AUTH FETCH
  const authFetch = async (url, method = "PUT", body = null) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:8000/api${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw await res.json();
    return res.json();
  };

  // ✅ OPEN RESCHEDULE MODAL
  const openModal = (id) => {
    setCurrentId(id);
    setModalOpen(true);
  };

  const submitReschedule = async () => {
    if (!newDate || !newTime) {
      toast.error("Select both date and time");
      return;
    }

    try {
      await authFetch(`/appointments/reschedule/${currentId}`, "PUT", {
        date: newDate,
        time: newTime,
      });

      toast.success("Appointment Rescheduled");
      setModalOpen(false);
      setNewDate("");
      setNewTime("");
      load();
    } catch (err) {
      toast.error(err?.message || "Reschedule failed");
    }
  };

  // ✅ CANCEL APPOINTMENT
  const cancel = async (id) => {
    if (!confirm("Cancel appointment?")) return;

    try {
      await authFetch(`/appointments/cancel/${id}`, "PUT");
      toast.success("Canceled");
      load();
    } catch (err) {
      toast.error(err?.message || "Cancel failed");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Appointments</h1>

        {/* ✅ FILTER DROPDOWN */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All</option>
          <option value="past">Past</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>

      {/* ✅ APPOINTMENT LIST */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-gray-500">No appointments found.</p>
        )}

        {filtered.map((a) => (
          <div
            key={a._id}
            className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{a.vaccine?.name || "Vaccine"}</div>
              <div>
                {new Date(a.date).toLocaleDateString()} at {a.time}
              </div>
            </div>

            <div className="space-x-3">
              <button
                onClick={() => openModal(a._id)}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Reschedule
              </button>

              <button
                onClick={() => cancel(a._id)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ MODAL */}
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white p-6 rounded-xl w-96 shadow-xl"
          >
            <h2 className="text-xl font-semibold mb-4">
              Reschedule Appointment
            </h2>

            <div className="space-y-3">
              <input
                type="date"
                className="w-full border rounded p-2"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />

              <input
                type="time"
                className="w-full border rounded p-2"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>

              <button
                onClick={submitReschedule}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
