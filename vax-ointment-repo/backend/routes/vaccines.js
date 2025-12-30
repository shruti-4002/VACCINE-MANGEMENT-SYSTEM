// backend/routes/vaccines.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); // expects req.user (from token)
const Vaccine = require("../models/Vaccine");

// GET all vaccines (public)
router.get("/", async (req, res) => {
  try {
    const list = await Vaccine.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vaccines" });
  }
});

// ADMIN: create vaccine
router.post("/", auth, async (req, res) => {
  try {
    // require admin role
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { name, quantity = 0, expiry } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    const doc = new Vaccine({
      name,
      quantity,
      expiry: expiry ? new Date(expiry) : undefined
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error("create vaccine error", err);
    res.status(500).json({ message: "Failed to create vaccine" });
  }
});

module.exports = router;
