require("dotenv").config();
console.log("Loaded MONGODB_URI =", process.env.MONGODB_URI);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// ✅ ROUTES
const authRoutes = require("./routes/auth");
const vaccineRoutes = require("./routes/vaccines");
const ointmentRoutes = require("./routes/ointments");
const appointmentRoutes = require("./routes/appointmentRoutes");
const dashboardRoutes = require("./routes/dashboard");
const adminStock = require("./routes/adminStock");
const reminderRoutes = require("./routes/reminders"); // ✅ REQUIRED

// ✅ MODELS
const Appointment = require("./models/Appointment");
const Vaccine = require("./models/Vaccine");
const Ointment = require("./models/Ointment"); // ✅ FIXED DUPLICATE

const { sendMail } = require("./utils/mailer");
const nodeCron = require("node-cron");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Database
connectDB();

// ✅ ROUTES MAPPING (THIS MUST MATCH FRONTEND EXACTLY)
app.use("/api/auth", authRoutes);
app.use("/api/vaccines", vaccineRoutes);
app.use("/api/ointments", ointmentRoutes);
app.use("/api/appointments", appointmentRoutes);     // ✅ user booking routes
app.use("/api/admin/stock", adminStock);              // ✅ stock
app.use("/api/appointments/reminders", reminderRoutes); // ✅ FIX FOR EMAIL REMINDERS
app.use("/api/dashboard", dashboardRoutes);           // ✅ dashboard stats

// ------------------------------------------------
// ✅ DAILY APPOINTMENT REMINDER (8 AM)
// ------------------------------------------------
nodeCron.schedule("0 8 * * *", async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const start = new Date(tomorrow.setHours(0, 0, 0, 0));
    const end = new Date(tomorrow.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      date: { $gte: start, $lte: end }
    }).populate("user vaccine");

    for (const a of appointments) {
      if (!a.user?.email) continue;

      const html = `
        <p>Hello ${a.user.name},</p>
        <p>Reminder for your appointment:</p>
        <p><b>${a.vaccine?.name}</b> on 
        <b>${new Date(a.date).toLocaleDateString()}</b>
        at <b>${a.time}</b></p>
      `;

      await sendMail({
        to: a.user.email,
        subject: "Appointment Reminder",
        html
      });
    }

    console.log("✅ Appointment reminders sent");
  } catch (err) {
    console.error("❌ Reminder Cron Error:", err);
  }
});

// ------------------------------------------------
// ✅ DAILY LOW STOCK EMAIL (7 AM)
// ------------------------------------------------
nodeCron.schedule("0 7 * * *", async () => {
  try {
    const threshold = 10;

    const lowVaccines = await Vaccine.find({ quantity: { $lte: threshold } });
    const lowOintments = await Ointment.find({ stock: { $lte: threshold } });

    if (!lowVaccines.length && !lowOintments.length) return;

    const html = `
      <h2>Low Stock Alert</h2>
      <h3>Vaccines</h3>
      <ul>${lowVaccines.map(v => `<li>${v.name} (${v.quantity})</li>`).join("")}</ul>
      <h3>Ointments</h3>
      <ul>${lowOintments.map(o => `<li>${o.name} (${o.stock})</li>`).join("")}</ul>
    `;

    await sendMail({
      to: "admin@example.com",
      subject: "Low Stock Alert",
      html
    });

    console.log("✅ Low stock email sent");
  } catch (err) {
    console.error("❌ Low Stock Cron Error:", err);
  }
});

// ✅ SERVER START
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server started on ${PORT}`));
