// backend/routes/reminders.js
const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// GET upcoming reminders
// Query options:
//  - ?all=1     => return all future appointments (date >= today start)
//  - ?days=N    => return appointments from today to today + N days (inclusive)
//  - default    => days=1 (tomorrow only) to preserve existing behaviour if you need
router.get("/upcoming", async (req, res) => {
  try {
    // allow either admin or unauthenticated use as you prefer; here it's public
    const { all, days } = req.query;

    const now = new Date();
    // normalize today to start of day local-time
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    let end;
    if (all && String(all) === "1") {
      // far-future end date (or omit end filter)
      end = null;
    } else {
      // days param (default 1 => tomorrow only was previous behaviour if you prefer).
      // NOTE: if you want tomorrow-only by default, set defaultDays=1 and use tomorrow start/end
      const n = Number(days ?? 7); // default to 7 days if no param — change to 1 for tomorrow-only
      const d = new Date(start);
      d.setDate(d.getDate() + n);
      d.setHours(23, 59, 59, 999);
      end = d;
    }

    const query = {
      // ensure we only fetch not-cancelled appointments
      canceled: { $ne: true }
    };

    // appointments where date is stored as Date objects (ISODate)
    query.date = end ? { $gte: start, $lte: end } : { $gte: start };

    const appts = await Appointment.find(query)
      .populate("user vaccine")
      .sort({ date: 1, time: 1 });

    res.json(appts);
  } catch (err) {
    console.error("reminders/upcoming error:", err);
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
});

module.exports = router;
