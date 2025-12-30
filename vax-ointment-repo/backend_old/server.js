
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const vaccineRoutes = require('./routes/vaccines');
const ointmentRoutes = require('./routes/ointments');
const appointmentRoutes = require('./routes/appointments');
const Appointment = require('./models/Appointment');
const { sendMail } = require('./utils/mailer');
const nodeCron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

connectDB(process.env.MONGODB_URI);

app.use('/api/auth', authRoutes);
app.use('/api/vaccines', vaccineRoutes);
app.use('/api/ointments', ointmentRoutes);
app.use('/api/appointments', appointmentRoutes);

// daily reminder job at 08:00 server time
nodeCron.schedule('0 8 * * *', async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0,0,0,0);
    const nextDayEnd = new Date(tomorrow);
    nextDayEnd.setHours(23,59,59,999);
    const appts = await Appointment.find({ date: { $gte: tomorrow, $lte: nextDayEnd }, reminderSent: false }).populate('user vaccine');
    for (const a of appts) {
      const html = `<p>Dear ${a.user.name},</p><p>You have an appointment scheduled on ${a.date.toLocaleString()} for ${a.vaccine?.name || 'ointment'}.</p>`;
      await sendMail({ to: a.user.email, subject: 'Appointment Reminder', html });
      a.reminderSent = true;
      await a.save();
    }
    console.log('Reminders processed', appts.length);
  } catch (err) { console.error('Reminder error', err); }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
