require("dotenv").config();
const connectDB = require("./config/db");
const Vaccine = require("./models/Vaccine");
const Ointment = require("./models/Ointment");
const Appointment = require("./models/Appointment");
const User = require("./models/User");

async function seed() {
  try {
    await connectDB();

    console.log("Connected to MongoDB");

    // Clear previous data
    await Vaccine.deleteMany();
    await Ointment.deleteMany();
    await Appointment.deleteMany();

    console.log("Old data cleared");

    // Insert Vaccines
    const vaccines = await Vaccine.insertMany([
      { name: "Covishield", quantity: 50, expiry: "2025-06-20" },
      { name: "Covaxin", quantity: 30, expiry: "2025-08-10" },
      { name: "Polio Vaccine", quantity: 100, expiry: "2026-01-15" },
      { name: "Hepatitis B", quantity: 70, expiry: "2025-09-01" },
      { name: "Tetanus Vaccine", quantity: 40, expiry: "2025-11-25" },
    ]);

    console.log("Vaccines inserted");

    // Insert Ointments
    const ointments = await Ointment.insertMany([
      { name: "BurnHeal", stock: 20 },
      { name: "Dermacare", stock: 35 },
      { name: "PainRelief", stock: 50 },
      { name: "ColdRub", stock: 15 },
      { name: "Antiseptic Cream", stock: 40 },
    ]);

    console.log("Ointments inserted");

    // Add sample appointments
    await Appointment.insertMany([
      {
        user: "dummy-user-1",
        vaccine: vaccines[0]._id,
        date: "2025-01-15",
      },
      {
        user: "dummy-user-2",
        vaccine: vaccines[2]._id,
        date: "2025-02-04",
      },
      {
        user: "dummy-user-3",
        vaccine: vaccines[4]._id,
        date: "2025-03-22",
      },
    ]);

    console.log("Appointments inserted");

    console.log("SEEDING SUCCESSFUL 🎉");
    process.exit(0);

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

seed();
