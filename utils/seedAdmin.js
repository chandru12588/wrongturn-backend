import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'admin@wrongturn.com';
    const exists = await Admin.findOne({ email });
    if (exists) {
      console.log('Admin exists:', exists.email);
      process.exit(0);
    }
    const hashed = await bcrypt.hash('ChangeMe123', 10);
    const a = await Admin.create({ name: 'Admin', email, password: hashed });
    console.log('Created admin:', a.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
