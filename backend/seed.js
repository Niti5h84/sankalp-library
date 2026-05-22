const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sankalp-library');
    console.log('MongoDB connected for seeding...');

    const adminExists = await Admin.findOne({ email: 'admin@sankalp.com' });
    if (adminExists) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new Admin({
      name: 'Default Admin',
      email: 'admin@sankalp.com',
      password: hashedPassword
    });

    await admin.save();
    console.log('Default Admin created successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
