
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vaccine = require('../models/Vaccine');

// get all
router.get('/', auth, async (req, res) => {
  const items = await Vaccine.find().sort({ createdAt: -1 });
  res.json(items);
});

// create (admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const item = await Vaccine.create(req.body);
  res.json(item);
});

// update
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const updated = await Vaccine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// delete
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await Vaccine.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
