// backend/routes/dashboard.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Vaccine = require("../models/Vaccine");
const Ointment = require("../models/Ointment");
const Appointment = require("../models/Appointment");

/**
 * GET /api/dashboard/stats
 * Query params (optional):
 *  - lowStockThreshold (number) default 10
 *  - expiringInDays (number) default 30
 */
router.get("/stats", auth, async (req, res) => {
  try {
    const lowStockThreshold = Number(req.query.lowStockThreshold) || 10;
    const expiringInDays = Number(req.query.expiringInDays) || 30;

    // totals
    const [totalVaccines, totalOintments, totalAppointments] = await Promise.all([
      Vaccine.countDocuments(),
      Ointment.countDocuments(),
      Appointment.countDocuments()
    ]);

    // low stock vaccines and ointments
    const lowStockVaccines = await Vaccine.find({ quantity: { $lte: lowStockThreshold } })
      .select("name quantity expiry")
      .lean();

    const lowStockOintments = await Ointment.find({ stock: { $lte: lowStockThreshold } })
      .select("name stock")
      .lean();

    // expiring vaccines within next expiringInDays
    const now = new Date();
    const expiringCutoff = new Date();
    expiringCutoff.setDate(now.getDate() + expiringInDays);

    const expiringVaccines = await Vaccine.find({
      expiry: { $exists: true, $ne: "", $lte: expiringCutoff }
    })
      .select("name expiry quantity")
      .lean();

    return res.json({
      totals: {
        vaccines: totalVaccines,
        ointments: totalOintments,
        appointments: totalAppointments
      },
      lowStock: {
        vaccines: lowStockVaccines,
        ointments: lowStockOintments
      },
      expiringSoon: expiringVaccines
    });
  } catch (err) {
    console.error("Dashboard stats error", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// PATCH /api/dashboard/mark-ordered/:type/:id
router.patch("/mark-ordered/:type/:id", auth, async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === "vaccine") {
      await Vaccine.findByIdAndUpdate(id, { quantity: 999 }); // restocked temporarily
    } else if (type === "ointment") {
      await Ointment.findByIdAndUpdate(id, { stock: 999 }); // restocked
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update item" });
  }
});

// 📌 PATCH /api/dashboard/mark-ordered/:type/:id
router.patch("/mark-ordered/:type/:id", auth, async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === "vaccine") {
      const updated = await Vaccine.findByIdAndUpdate(
        id,
        { quantity: 999 }, // assumed restocked
        { new: true }
      );
      return res.json(updated);
    }

    if (type === "ointment") {
      const updated = await Ointment.findByIdAndUpdate(
        id,
        { stock: 999 },
        { new: true }
      );
      return res.json(updated);
    }

    return res.status(400).json({ message: "Invalid type" });
  } catch (err) {
    console.error("Order update error", err);
    res.status(500).json({ message: "Failed to update item" });
  }
});

// 📌 GET last 7 days appointment counts
router.get("/chart/appointments", auth, async (req, res) => {
  try {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);

      const yyyy = day.getFullYear();
      const mm = String(day.getMonth() + 1).padStart(2, "0");
      const dd = String(day.getDate()).padStart(2, "0");

      const dayStr = `${yyyy}-${mm}-${dd}`;

      const count = await Appointment.countDocuments({ date: dayStr });

      result.push({
        date: dayStr,
        count,
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Chart error", err);
    res.status(500).json({ message: "Failed to generate chart" });
  }
});

module.exports = router;
