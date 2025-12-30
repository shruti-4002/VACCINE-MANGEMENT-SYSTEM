// backend/controllers/appointmentController.js
const Appointment = require("../models/Appointment");
const Vaccine = require("../models/Vaccine");
const User = require("../models/User");
const sendMail = require("../utils/mailer"); // optional, gracefully handles missing SMTP

// helper: check if date is valid (simple)
function isValidDateString(s) {
  // expects YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

exports.bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vaccineId, date, time } = req.body;
    if (!vaccineId || !date || !time) return res.status(400).json({ message: "Missing fields" });
    if (!isValidDateString(date)) return res.status(400).json({ message: "Invalid date" });

    const vaccine = await Vaccine.findById(vaccineId);
    if (!vaccine) return res.status(404).json({ message: "Vaccine not found" });
    if (vaccine.quantity <= 0) return res.status(400).json({ message: "Vaccine out of stock" });

    // prevent same user same datetime
    const exists = await Appointment.findOne({ user: userId, date, time, canceled: false });
    if (exists) return res.status(400).json({ message: "You already have an appointment at this time." });

    // create
    const appt = new Appointment({ user: userId, vaccine: vaccineId, date, time });
    await appt.save();

    // decrement stock
    vaccine.quantity = Math.max(0, vaccine.quantity - 1);
    await vaccine.save();

    // send confirmation email if configured (non-blocking)
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        await sendMail({
          to: user.email,
          subject: "Appointment Confirmed",
          html: `<p>Hi ${user.name || user.email}, your appointment for ${vaccine.name} is confirmed on ${date} at ${time}.</p>`
        });
      }
    } catch (e) {
      console.log("mail error:", e.message);
    }

    res.status(201).json({ message: "Appointment booked", appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const list = await Appointment.find({ user: req.user.id, canceled: false })
      .populate("vaccine")
      .sort({ date: 1, time: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, user: req.user.id });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (appt.canceled) return res.status(400).json({ message: "Already canceled" });

    appt.canceled = true;
    appt.canceledAt = new Date();
    await appt.save();

    // restore vaccine stock
    const vaccine = await Vaccine.findById(appt.vaccine);
    if (vaccine) { vaccine.quantity += 1; await vaccine.save(); }

    res.json({ message: "Appointment canceled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).json({ message: "Missing date/time" });
    if (!isValidDateString(date)) return res.status(400).json({ message: "Invalid date" });

    const appt = await Appointment.findOne({ _id: req.params.id, user: req.user.id });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (appt.canceled) return res.status(400).json({ message: "Cannot reschedule canceled appointment" });

    // prevent double booking
    const conflict = await Appointment.findOne({ user: req.user.id, date, time, canceled: false });
    if (conflict) return res.status(400).json({ message: "You already have an appointment at this time." });

    appt.date = date;
    appt.time = time;
    appt.rescheduledAt = new Date();
    await appt.save();

    res.json({ message: "Appointment rescheduled", appointment: appt });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllAppointmentsForAdmin = async (req, res) => {
  try {
    // you can add admin check here (req.user.isAdmin)
    const list = await Appointment.find().populate("user vaccine").sort({ date: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
