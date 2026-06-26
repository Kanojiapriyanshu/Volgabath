import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';
import Technician from './models/Technician.js';
import { syncCustomersFromComplaints } from './utils/customerService.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plumbing-cms');

  const email = 'admin@plumbing.com';
  const existing = await Admin.findOne({ email });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await Admin.create({ email, password: hashed });
    console.log('Admin created: admin@plumbing.com / admin123');
  } else {
    console.log('Admin already exists');
  }

  const techCount = await Technician.countDocuments();
  if (techCount === 0) {
    await Technician.insertMany([
      { name: 'Ravi Kumar', phone: '9876543210', serviceArea: 'North Zone', isAvailable: true },
      { name: 'Suresh Patel', phone: '9876543211', serviceArea: 'South Zone', isAvailable: true },
      { name: 'Amit Sharma', phone: '9876543212', serviceArea: 'Central Zone', isAvailable: true },
    ]);
    console.log('Sample technicians created');
  }

  await syncCustomersFromComplaints();
  console.log('Customers synced from existing complaints');

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch(console.error);
