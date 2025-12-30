import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

export default function AdminAppointments() {
  const [list, setList] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/api/appointments/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setList(data || []);
    } catch {
      toast.error("Failed to load all appointments");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ DATE RANGE FILTER
  const filtered = list.filter((a) => {
    const date = new Date(a.date);
    if (from && date < new Date(from)) return false;
    if (to && date > new Date(to)) return false;
    return true;
  });

  // ✅ PDF DOWNLOAD WITH DATE RANGE
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Appointment Report", 10, 10);

    let y = 20;
    filtered.forEach((a, i) => {
      doc.text(
        `${i + 1}. ${a.user?.name} | ${a.vaccine?.name} | ${
          new Date(a.date).toLocaleDateString()
        } ${a.time}`,
        10,
        y
      );
      y += 10;
    });

    doc.save("appointment-report.pdf");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">All Appointments (Admin)</h1>

      {/* ✅ DATE FILTERS */}
      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Download PDF Report
        </button>
      </div>

      {filtered.length === 0 && <p>No appointments found.</p>}

      <div className="space-y-4">
        {filtered.map((a) => (
          <div key={a._id} className="p-4 border rounded shadow">
            <div className="font-semibold">{a.user?.name}</div>
            <div>{a.vaccine?.name}</div>
            <div>
              {new Date(a.date).toLocaleDateString()} at {a.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
