const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const sendMail = require("../utils/mailer");
const moment = require("moment");

// Run every day at 09:00
module.exports = function startReminders() {
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("Running reminder cron:", new Date());
      const tomorrow = moment().add(1, "day").format("YYYY-MM-DD");

      const appts = await Appointment.find({ date: tomorrow, canceled: { $ne: true } }).populate("user vaccine");
      for (const a of appts) {
        const user = a.user;
        const vaccineName = a.vaccine?.name || "vaccine";

        await sendMail({
          to: user.email,
          subject: "Appointment Reminder",
          html: `<p>Hi ${user.name || ""}, this is a reminder for your appointment for ${vaccineName} on ${a.date} at ${a.time}.</p>`
        }).catch(err => console.error("Reminder mail error:", err.message));
      }

      // low stock alert for admin
      const Vaccine = require("../models/Vaccine");
      const low = await Vaccine.find({ quantity: { $lte: 5 } });
      if (low.length) {
        await sendMail({
          to: process.env.FROM_EMAIL || process.env.SMTP_USER,
          subject: "Low stock alert",
          html: `<p>Low stock detected for: ${low.map(v=>v.name+" ("+v.quantity+")").join(", ")}</p>`
        }).catch(e => console.log("admin mail err", e.message));
      }

    } catch (err) {
      console.error("Reminder cron error", err);
    }
  }, {
    timezone: process.env.TIMEZONE || "Asia/Kolkata"
  });
};
