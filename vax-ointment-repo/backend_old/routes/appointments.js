
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// schedule
router.post('/', auth, async (req, res) => {
  const data = { ...req.body, user: req.user._id };
  const appt = await Appointment.create(data);
  res.json(appt);
});

// get user's appointments
router.get('/me', auth, async (req, res) => { res.json(await Appointment.find({ user: req.user._id }).populate('vaccine ointment')); });

// admin get all
router.get('/', auth, async (req, res) => { if (req.user.role!=='admin') return res.status(403).json({message:'Forbidden'}); res.json(await Appointment.find().populate('user vaccine ointment')); });

// update status
router.put('/:id/status', auth, async (req, res) => { if (req.user.role!=='admin') return res.status(403).json({message:'Forbidden'}); const ap = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); res.json(ap); });

module.exports = router;
