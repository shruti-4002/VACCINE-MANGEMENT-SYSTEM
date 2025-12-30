
const mongoose = require('mongoose');
const AppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vaccine: { type: mongoose.Schema.Types.ObjectId, ref: 'Vaccine' },
  ointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Ointment' },
  date: { type: Date, required: true },
  timeSlot: String,
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Appointment', AppointmentSchema);
