
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Vaccine = require('./models/Vaccine');

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vaxdb');
    // create admin if not exists
    let admin = await User.findOne({ email: 'admin@vax.local' });
    if (!admin) {
      const bcrypt = require('bcryptjs');
      const pass = await bcrypt.hash('Admin@123', 10);
      admin = await User.create({ name: 'Admin', email: 'admin@vax.local', password: pass, role: 'admin' });
      console.log('Created admin: admin@vax.local / Admin@123');
    } else {
      console.log('Admin already exists');
    }
    // sample vaccine
    const existing = await Vaccine.findOne({ name: 'Covishield' });
    if (!existing) {
      const v = await Vaccine.create({ name: 'Covishield', manufacturer: 'ACME', quantity: 50, notes: 'Demo' });
      console.log('Created sample vaccine', v.name);
    } else {
      console.log('Sample vaccine exists');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
