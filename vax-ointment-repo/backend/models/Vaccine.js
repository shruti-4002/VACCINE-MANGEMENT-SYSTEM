
const mongoose = require('mongoose');
const VaccineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manufacturer: String,
  batch: String,
  quantity: { type: Number, default: 0 },
  expiry: Date,
  notes: String
}, { timestamps: true });
module.exports = mongoose.model('Vaccine', VaccineSchema);
