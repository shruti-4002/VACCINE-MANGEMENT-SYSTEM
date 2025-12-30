const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Appointment = require("../models/Appointment");
const { sendMail } = require("../utils/mailer"); // ✅ FIXED IMPORT

// ✅ ADMIN: GET ALL Appointments
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access only" });

    const appts = await Appointment.find()
      .populate("user")
      .populate("vaccine");

    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: "Failed to load appointments" });
  }
});

// ✅ ADMIN REPORT
router.get("/report", auth, async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate("user", "name email")
      .populate("vaccine", "name");

    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate report" });
  }
});

// ✅ UPCOMING REMINDERS (TOMORROW)
router.get("/reminders/upcoming", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access only" });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const start = new Date(tomorrow.setHours(0, 0, 0, 0));
    const end = new Date(tomorrow.setHours(23, 59, 59, 999));

    const appts = await Appointment.find({
      date: { $gte: start, $lte: end },
      status: { $ne: "cancelled" },
    }).populate("user vaccine");

    res.json(appts);
  } catch (err) {
    console.error("REMINDER FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
});

// ✅ SEND EMAIL REMINDER
router.post("/reminders/send", auth, async (req, res) => {
  const { appointmentId } = req.body;

  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access only" });

    const appt = await Appointment.findById(appointmentId)
      .populate("user vaccine");

    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    await sendMail({
      to: appt.user.email,
      subject: "Vaccine Appointment Reminder",
      html: `
        <h3>Hello ${appt.user.name},</h3>
        <p>This is a reminder for your appointment:</p>
        <p><b>Vaccine:</b> ${appt.vaccine.name}</p>
        <p><b>Date:</b> ${new Date(appt.date).toLocaleDateString()}</p>
        <p><b>Time:</b> ${appt.time}</p>
        <br/>
        <p>Thank you!</p>
      `,
    });

    res.json({ message: "Reminder sent successfully!" });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ message: "Error sending reminder" });
  }
});

module.exports = router;
