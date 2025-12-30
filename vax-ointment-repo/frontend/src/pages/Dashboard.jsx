// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getDashboardStats } from "../api";

// Chart.js imports + registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <div className="p-6 text-xl">Loading dashboard…</div>;
  if (!stats) return <div className="p-6 text-red-600">Failed to load stats</div>;

  // CHART DATA
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        id: "id1",
        label: "Appointments",
        data: [2, 4, 3, 6, 5, 7, 3],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.3)",
      },
    ],
  };

  const barData = {
    labels: ["Vaccines", "Ointments", "Appointments"],
    datasets: [
      {
        id: "id2",
        label: "Total Items",
        data: [
          stats.totals.vaccines,
          stats.totals.ointments,
          stats.totals.appointments,
        ],
        backgroundColor: ["#60a5fa", "#34d399", "#fbbf24"],
      },
    ],
  };

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {/* TOTALS */}
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-blue-100 rounded-xl shadow">
          <div className="text-xl font-semibold">Vaccines</div>
          <div className="text-3xl font-bold">{stats.totals.vaccines}</div>
        </div>

        <div className="p-6 bg-green-100 rounded-xl shadow">
          <div className="text-xl font-semibold">Ointments</div>
          <div className="text-3xl font-bold">{stats.totals.ointments}</div>
        </div>

        <div className="p-6 bg-yellow-100 rounded-xl shadow">
          <div className="text-xl font-semibold">Appointments</div>
          <div className="text-3xl font-bold">{stats.totals.appointments}</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="font-semibold mb-4">Appointments Trend</h2>
          <Line key="line-chart" data={lineData} />
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="font-semibold mb-4">Inventory Comparison</h2>
          <Bar key="bar-chart" data={barData} />
        </div>
      </div>
      <p>Email reminders active for tomorrow’s appointments</p>

    </div>
  );
}
