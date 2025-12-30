// src/pages/BookVaccine.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  getVaccines,
  getAppointmentsByDate,
  createAppointment
} from "../api";

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function humanDate(date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function generateMonthlyGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const weeks = [];
  let week = [];
  const leadEmpty = (first.getDay() + 6) % 7;

  for (let i = 0; i < leadEmpty; i++) week.push(null);

  for (let d = 1; d <= last.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  while (week.length < 7) week.push(null);
  weeks.push(week);
  return weeks;
}

function generateSlots(start = 9, end = 17) {
  const slots = [];
  for (let hour = start; hour < end; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
}

const defaultSlots = generateSlots();

export default function BookVaccine() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [weeks, setWeeks] = useState(() =>
    generateMonthlyGrid(today.getFullYear(), today.getMonth())
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [vaccines, setVaccines] = useState([]);
  const [selectedVaccineId, setSelectedVaccineId] = useState("");
  const [busySlots, setBusySlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  useEffect(() => {
    setWeeks(
      generateMonthlyGrid(viewDate.getFullYear(), viewDate.getMonth())
    );
  }, [viewDate]);

  // ✅ LOAD VACCINES
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getVaccines();
        setVaccines(data || []);
        if (data?.length && !selectedVaccineId)
          setSelectedVaccineId(data[0]._id || data[0].id);
      } catch (err) {
        toast.error("Failed to load vaccines");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ LOAD BUSY SLOTS
  useEffect(() => {
    if (!selectedDate) {
      setBusySlots([]);
      return;
    }

    const iso = formatDateISO(selectedDate);
    setFetchingSlots(true);

    getAppointmentsByDate(iso)
      .then((appts) => {
        const taken = (appts || []).map(a => a.time).filter(Boolean);
        setBusySlots(taken);
      })
      .catch(() => {
        toast.error("Failed to load bookings for this date");
      })
      .finally(() => setFetchingSlots(false));
  }, [selectedDate]);

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  // ✅ FINAL FIXED BOOKING FUNCTION
  async function handleBook(e) {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !selectedVaccineId) {
      toast.warn("Please select date, time and vaccine");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vaccine: selectedVaccineId,   // ✅ THIS FIXES YOUR CRASH
        date: formatDateISO(selectedDate),
        time: selectedTime
      };


      await createAppointment(payload);
      toast.success("Appointment created");
      navigate("/appointments");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Booking failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-extrabold mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Book Vaccine
        </motion.h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">
                {viewDate.toLocaleString(undefined, {
                  month: "long",
                  year: "numeric"
                })}
              </div>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="px-3 py-1 rounded border">Prev</button>
                <button onClick={nextMonth} className="px-3 py-1 rounded border">Next</button>
              </div>
            </div>

            {/* ✅✅✅ YOUR ORIGINAL CALENDAR — UNCHANGED */}
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-sm text-gray-600">
                  <th className="py-2">Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, i) => (
                  <tr key={i}>
                    {week.map((d, j) => {
                      const isToday = d && formatDateISO(d) === formatDateISO(today);
                      const disabled = !d || d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const selected = d && selectedDate && formatDateISO(d) === formatDateISO(selectedDate);
                      return (
                        <td key={j} className="p-2 align-top">
                          <div
                            onClick={() => { if (!disabled && d) { setSelectedDate(new Date(d)); setSelectedTime(""); } }}
                            className={
                              `cursor-pointer select-none p-3 rounded-lg transition
                              ${disabled ? "opacity-30 pointer-events-none" : ""}
                              ${selected ? "bg-blue-600 text-white" : "bg-white"}
                              ${isToday && !selected ? "ring-2 ring-blue-200" : ""}`
                            }
                          >
                            <div className={`text-sm font-semibold ${selected ? "text-white" : "text-gray-800"}`}>
                              {d ? d.getDate() : ""}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 border-t pt-4">
              {!selectedDate ? (
                <div className="text-gray-600">Select a date on the calendar to pick a time slot</div>
              ) : (
                <>
                  <div className="mb-2 text-gray-800 font-medium">{humanDate(selectedDate)}</div>
                  <div className="flex flex-wrap gap-3">
                    {fetchingSlots ? (
                      <div className="text-gray-500">Loading slots...</div>
                    ) : (
                      defaultSlots.map(slot => {
                        const taken = busySlots.includes(slot);
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            disabled={taken}
                            onClick={() => setSelectedTime(slot)}
                            className={`px-3 py-2 rounded-md text-sm border transition
                                ${taken ? "bg-red-100 border-red-300 text-red-500 opacity-60 cursor-not-allowed" : ""}
                                ${isSelected ? "bg-blue-600 text-white border-blue-700" : "bg-white text-gray-800 hover:bg-blue-50"}
                            `}
                          >
                            {slot}
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <motion.div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
            <select
              className="w-full border p-3 rounded"
              value={selectedVaccineId}
              onChange={e => setSelectedVaccineId(e.target.value)}
            >
              {vaccines.map(v => (
                <option key={v._id || v.id} value={v._id || v.id}>
                  {v.name} (Qty: {v.quantity ?? 0})
                </option>
              ))}
            </select>

            <input className="w-full border p-3 rounded" value={selectedDate ? humanDate(selectedDate) : ""} readOnly />
            <input className="w-full border p-3 rounded" value={selectedTime} readOnly />

            <button onClick={handleBook} disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
