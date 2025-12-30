
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Ointment = require('../models/Ointment');

router.get('/', auth, async (req, res) => { res.json(await Ointment.find().sort({ createdAt: -1 })); });
router.post('/', auth, async (req, res) => { if (req.user.role!=='admin') return res.status(403).json({message:'Forbidden'}); res.json(await Ointment.create(req.body)); });
router.put('/:id', auth, async (req, res) => { if (req.user.role!=='admin') return res.status(403).json({message:'Forbidden'}); res.json(await Ointment.findByIdAndUpdate(req.params.id, req.body, {new:true})); });
router.delete('/:id', auth, async (req, res) => { if (req.user.role!=='admin') return res.status(403).json({message:'Forbidden'}); await Ointment.findByIdAndDelete(req.params.id); res.json({message:'Deleted'}); });

module.exports = router;
