const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vaccine: { type: mongoose.Schema.Types.ObjectId, ref: "Vaccine", required: true },

  // ✅ FIX: DATE MUST BE Date, NOT String
  date: { type: Date, required: true },

  time: { type: String, required: true }, // HH:mm

  createdAt: { type: Date, default: Date.now },

  canceled: { type: Boolean, default: false },
  canceledAt: { type: Date },
  rescheduledAt: { type: Date }
});

// ✅ FIX: FORCE CORRECT COLLECTION NAME
module.exports = mongoose.model(
  "Appointment",
  appointmentSchema,
  "appointments"
);
