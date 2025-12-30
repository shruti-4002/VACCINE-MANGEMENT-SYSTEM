
const mongoose = require('mongoose');
const OintmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  quantity: { type: Number, default: 0 },
  expiry: Date,
  notes: String
}, { timestamps: true });
module.exports = mongoose.model('Ointment', OintmentSchema);
