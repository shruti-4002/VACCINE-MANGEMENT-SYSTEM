import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSyringe, FaCalendarCheck, FaShieldAlt, FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">

      {/* FLOATING GRADIENT BLOBS */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-blue-200 opacity-40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 opacity-40 rounded-full blur-3xl"></div>

      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between px-10 py-24 relative z-10">

            {/* 🌟 FLOATING ICONS — ADD THEM HERE */}
      <motion.div
        className="absolute top-40 right-20 text-blue-500 text-5xl opacity-40"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        💉
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-20 text-green-500 text-5xl opacity-40"
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        🩺
      </motion.div>

      <motion.div
        className="absolute top-60 left-1/2 text-purple-500 text-5xl opacity-40"
        animate={{ y: [0, -25, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
      >
        💊
      </motion.div>
      
        {/* LEFT TEXT */}
        <motion.div
          className="md:w-1/2 space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
            Smarter <span className="text-blue-600">Vaccination</span> <br />
            & Ointment Management
          </h1>

          <p className="text-lg text-gray-600 pr-8">
            Skip manual processes — automate vaccine booking, ointment tracking,
            reminders, and inventory management all in one place.
          </p>

          <div className="flex gap-6 mt-6">
            <Link
            to={localStorage.getItem("token") ? "/dashboard" : "/register"}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg 
                      hover:bg-blue-700 hover:scale-105 transition flex items-center gap-2"
          >
            Get Started <FaArrowRight />
          </Link>

            <Link
            to={localStorage.getItem("token") ? "/vaccines" : "/login"}
            className="px-6 py-3 bg-white border border-blue-600 text-blue-600 
                      rounded-xl shadow hover:bg-blue-50 hover:scale-105 transition"
          >
            View Vaccines
          </Link>

          </div>
        </motion.div>

        {/* RIGHT CARD */}
        <motion.div
          className="md:w-1/2 flex justify-center mt-14 md:mt-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
        >
          <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl p-10 w-80 text-center hover:scale-105 transition">
            <FaShieldAlt className="text-blue-600 text-7xl mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-2">Stay Safe, Stay Organized</h3>
            <p className="text-gray-600">
              Your health data managed with security and precision.
            </p>
          </div>
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <div className="py-20 px-10 md:px-20 bg-white/40 backdrop-blur-md shadow-inner relative z-10">

        <motion.h2
          className="text-center text-4xl font-bold mb-12 text-gray-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          What Our System Offers
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-10">

          {/* Feature 1 */}
          <motion.div
            className="p-8 border rounded-2xl shadow-lg bg-blue-50 hover:shadow-2xl transition"
            whileHover={{ scale: 1.05 }}
          >
            <FaSyringe className="text-blue-600 text-5xl mb-4" />
            <h3 className="font-semibold text-2xl mb-2">Live Vaccine Tracking</h3>
            <p className="text-gray-600">Instant availability updates for all vaccines.</p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="p-8 border rounded-2xl shadow-lg bg-green-50 hover:shadow-2xl transition"
            whileHover={{ scale: 1.05 }}
          >
            <FaCalendarCheck className="text-green-600 text-5xl mb-4" />
            <h3 className="font-semibold text-2xl mb-2">Online Appointment Booking</h3>
            <p className="text-gray-600">Book vaccines anytime with automated reminders.</p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="p-8 border rounded-2xl shadow-lg bg-purple-50 hover:shadow-2xl transition"
            whileHover={{ scale: 1.05 }}
          >
            <FaShieldAlt className="text-purple-600 text-5xl mb-4" />
            <h3 className="font-semibold text-2xl mb-2">Ointment Management</h3>
            <p className="text-gray-600">Track stock and manage medical ointments easily.</p>
          </motion.div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Vax & Ointment System — Designed with ❤️ for better health.
      </footer>
    </div>
  );
}
{/* TESTIMONIAL SECTION */}
<div className="py-20 px-10 md:px-20 bg-white dark:bg-gray-900 relative z-10">

  <motion.h2
    className="text-center text-4xl font-bold mb-14 text-gray-900 dark:text-white"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >
    What People Are Saying
  </motion.h2>

  <div className="grid md:grid-cols-3 gap-8">

    {[1,2,3].map((item, index) => (
      <motion.div
        key={index}
        className="p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
        whileHover={{ scale: 1.05 }}
      >
        <p className="text-gray-600 dark:text-gray-300 italic mb-4">
          “This system made vaccine booking so easy. Reminders are perfect!”
        </p>

        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
          Priya Sharma
        </h3>

        <p className="text-sm text-blue-600 dark:text-blue-400">
          Working Professional
        </p>
      </motion.div>
    ))}

  </div>
</div>
