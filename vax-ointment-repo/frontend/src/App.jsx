import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

import Vaccines from "./pages/Vaccines";
import Ointments from "./pages/Ointments";
import Dashboard from "./pages/Dashboard";
import BookVaccine from "./pages/BookVaccine";
import MyAppointments from "./pages/MyAppointments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminAppointments from "./pages/AdminAppointments";
import ManageStock from "./pages/ManageStock";
import OtpLogin from "./pages/OtpLogin";
import ReminderDashboard from "./pages/ReminderDashboard";
import Reminders from "./pages/Reminders";
import EmailReminders from "./pages/EmailReminders";

export default function App() {

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ ALWAYS SYNC AUTH ON LOAD & LOGIN
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user"));

    setToken(savedToken);
    setUser(savedUser);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    window.location.href = "/";
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* ✅ NAVBAR */}
      <header className="p-4 flex justify-between items-center border-b bg-white dark:bg-gray-900">
        <Link to="/" className="font-bold text-lg dark:text-white">
          Vax & Ointment
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 text-gray-700 dark:text-gray-200">

            <Link to="/vaccines">Vaccines</Link>
            <Link to="/ointments">Ointments</Link>

            {/* ✅ USER NAV */}
            {token && !isAdmin && (
              <>
                <Link to="/book">Book</Link>
                <Link to="/appointments">My Appointments</Link>
              </>
            )}

            {/* ✅ ADMIN NAV */}
            {token && isAdmin && (
              <>
                <Link to="/dashboard">Admin Dashboard</Link>
                <Link to="/all-appointments">All Appointments</Link>
                <Link to="/manage-stock">Manage Stock</Link>
                <Link to="/reminders">Email Reminders</Link>
              </>
            )}

            {/* ✅ LOGIN / LOGOUT */}
            {!token ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/otp-login">OTP Login</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            )}
          </nav>

          <button
            onClick={toggleDark}
            className="text-2xl cursor-pointer text-gray-700 dark:text-gray-200"
          >
            🌙
          </button>
        </div>
      </header>

      {/* ✅ ROUTES */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vaccines" element={<Vaccines />} />
        <Route path="/ointments" element={<Ointments />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookVaccine />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/all-appointments" element={<AdminAppointments />} />
        <Route path="/manage-stock" element={<ManageStock />} />
        <Route path="/otp-login" element={<OtpLogin />} />
        <Route path="/reminders" element={<ReminderDashboard />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/reminders" element={<EmailReminders />} />
      </Routes>
    </>
  );
}