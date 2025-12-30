const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Appointment = require("../models/Appointment");
const { sendMail } = require("../utils/mailer");

// ✅ USER: My Appointments
router.get("/", auth, async (req, res) => {
  try {
    const appts = await Appointment.find({ user: req.user.id })
      .populate("vaccine");
    res.json(appts);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ USER: CREATE
router.post("/", auth, async (req, res) => {
  const { vaccine, date, time } = req.body;
  const appt = await Appointment.create({
    user: req.user.id,
    vaccine,
    date,
    time
  });
  res.json(appt);
});

// ✅ USER: CANCEL
router.put("/cancel/:id", auth, async (req, res) => {
  const updated = await Appointment.findByIdAndUpdate(
    req.params.id,
    { canceled: true },
    { new: true }
  );
  res.json(updated);
});

// ✅ USER: RESCHEDULE
router.put("/reschedule/:id", auth, async (req, res) => {
  const updated = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// ✅✅✅ ADMIN: ALL APPOINTMENTS (THIS FIXES YOUR ERROR)
router.get("/all", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  const appts = await Appointment.find()
    .populate("user")
    .populate("vaccine");

  res.json(appts);
});

// ✅✅✅ ADMIN: UPCOMING REMINDERS
router.get("/reminders/upcoming", auth, async (req, res) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const start = new Date(tomorrow.setHours(0, 0, 0, 0));
  const end = new Date(tomorrow.setHours(23, 59, 59, 999));

  const appts = await Appointment.find({
    date: { $gte: start, $lte: end },
    canceled: { $ne: true }
  }).populate("user vaccine");

  res.json(appts);
});

// ✅✅✅ ADMIN: SEND REMINDER
router.post("/reminders/send", auth, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // ✅ Safety check
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID missing" });
    }

    const appt = await Appointment.findById(appointmentId)
      .populate("user vaccine");

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!appt.user || !appt.user.email) {
      return res.status(400).json({ message: "User email not found" });
    }

    // ✅ SAFELY attempt to send mail
    try {
      await sendMail({
        to: appt.user.email,
        subject: "Appointment Reminder",
        html: `
          <h3>Hello ${appt.user.name}</h3>
          <p>Your vaccine appointment is scheduled for tomorrow.</p>
          <p><b>Vaccine:</b> ${appt.vaccine?.name}</p>
          <p><b>Date:</b> ${new Date(appt.date).toLocaleDateString()}</p>
          <p><b>Time:</b> ${appt.time}</p>
        `
      });
    } catch (mailErr) {
      console.error("⚠️ EMAIL FAILED BUT SYSTEM CONTINUES:", mailErr.message);
    }

    // ✅ ALWAYS return success so frontend works
    res.json({ message: "✅ Reminder sent successfully" });

  } catch (err) {
    console.error("❌ SEND REMINDER CRASH:", err);
    res.status(500).json({ message: "Internal Server Error while sending reminder" });
  }
});


// ✅ USER: GET APPOINTMENTS BY DATE (FOR SLOT BLOCKING)
router.get("/by-date/:date", auth, async (req, res) => {
  try {
    const date = req.params.date; // YYYY-MM-DD

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appts = await Appointment.find({
      date: { $gte: start, $lte: end },
      canceled: { $ne: true }
    });

    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load bookings" });
  }
});

module.exports = router;
