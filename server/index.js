import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import Admin from './models/Admin.js';
import Technician from './models/Technician.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/technicians', technicianRoutes);
app.use('/api/admin/customers', customerRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

async function seedAdmin() {
  const email = 'admin@plumbing.com';
  const existing = await Admin.findOne({ email });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await Admin.create({ email, password: hashed });
    console.log('✅ Admin created: admin@plumbing.com / admin123');
  } else {
    console.log('ℹ️ Admin already exists');
  }
}

async function seedTechnicians() {
  const techCount = await Technician.countDocuments();
  if (techCount === 0) {
    await Technician.insertMany([
      { name: 'Ravi Kumar', phone: '9876543210', serviceArea: 'North Zone', isAvailable: true },
      { name: 'Suresh Patel', phone: '9876543211', serviceArea: 'South Zone', isAvailable: true },
      { name: 'Amit Sharma', phone: '9876543212', serviceArea: 'Central Zone', isAvailable: true },
    ]);
    console.log('✅ Sample technicians created');
  } else {
    console.log('ℹ️ Technicians already exist');
  }
}

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plumbing-cms')
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    await seedTechnicians();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
