import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Complaint from '../models/Complaint.js';
import Admin from '../models/Admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  sendAssignmentMessage,
  sendResolutionMessage,
} from '../services/whatsappService.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, email: admin.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/complaints', authMiddleware, async (req, res) => {
  try {
    const { status, date, search } = req.query;
    const filter = {};

    if (status) filter.status = status;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ customerName: regex }, { complaintId: regex }, { phone: regex }];
    }

    const complaints = await Complaint.find(filter)
      .populate('technicianId', 'name phone serviceArea')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/complaints/:id', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'technicianId',
      'name phone serviceArea isAvailable'
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/complaints/:id/assign', authMiddleware, async (req, res) => {
  try {
    const { technicianId } = req.body;
    if (!technicianId) {
      return res.status(400).json({ message: 'Technician ID is required' });
    }

    const complaint = await Complaint.findById(req.params.id).populate('technicianId');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'New Request') {
      return res.status(400).json({ message: 'Complaint is not in New Request status' });
    }

    const Technician = (await import('../models/Technician.js')).default;
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    complaint.technicianId = technicianId;
    complaint.status = 'Technician Assigned';
    await complaint.save();
    await complaint.populate('technicianId', 'name phone serviceArea');

    sendAssignmentMessage(
      complaint.customerName,
      complaint.phone,
      technician.name,
      technician.phone
    ).catch(console.error);

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/complaints/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Technician Assigned') {
      return res.status(400).json({ message: 'Complaint must be assigned before resolving' });
    }

    complaint.status = 'Resolved';
    await complaint.save();
    await complaint.populate('technicianId', 'name phone serviceArea');

    sendResolutionMessage(
      complaint.customerName,
      complaint.phone,
      complaint.complaintId
    ).catch(console.error);

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
