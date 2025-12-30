// backend/routes/adminStock.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); // must set req.user
const Vaccine = require("../models/Vaccine");

// GET all vaccines (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    const list = await Vaccine.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH update quantity
router.patch("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity == null || isNaN(Number(quantity)))
      return res.status(400).json({ message: "Invalid quantity" });

    const v = await Vaccine.findById(id);
    if (!v) return res.status(404).json({ message: "Vaccine not found" });

    v.quantity = Math.max(0, Number(quantity));
    await v.save();

    res.json({ message: "Updated", vaccine: v });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
