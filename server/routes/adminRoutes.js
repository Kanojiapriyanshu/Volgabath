import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Complaint from '../models/Complaint.js';
import Customer from '../models/Customer.js';
import Technician from '../models/Technician.js';
import Admin from '../models/Admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { generateComplaintId } from '../utils/complaintId.js';
import { upsertCustomer, cleanPhone, PHONE_REGEX } from '../utils/customerService.js';
import { upload, uploadErrorHandler } from '../middleware/upload.js';

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

router.post('/complaints', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      phone,
      category,
      address,
      description,
      technicianId,
    } = req.body;

    let name = customerName?.trim();
    let customerPhone = cleanPhone(phone);
    let customerAddress = address?.trim();

    if (customerId) {
      const existing = await Customer.findById(customerId);
      if (!existing) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      name = name || existing.name;
      customerPhone = existing.phone;
      customerAddress = customerAddress || existing.address || '';
    }

    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    if (!PHONE_REGEX.test(customerPhone)) {
      return res.status(400).json({ message: 'Valid 10-digit Indian mobile number is required' });
    }

    let technician = null;
    if (technicianId) {
      technician = await Technician.findById(technicianId);
      if (!technician) {
        return res.status(404).json({ message: 'Technician not found' });
      }
    }

    const complaintId = await generateComplaintId();
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;

    await upsertCustomer({
      name,
      phone: customerPhone,
      address: customerAddress,
    });

    const complaint = await Complaint.create({
      complaintId,
      customerName: name,
      phone: customerPhone,
      category: category || 'Other',
      address: customerAddress,
      description: description?.trim(),
      photo,
      status: technician ? 'Technician Assigned' : 'New Request',
      ...(technician ? { technicianId: technician._id } : {}),
    });

    await complaint.populate('technicianId', 'name phone serviceArea');

    res.status(201).json(complaint);
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

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status === 'Resolved') {
      return res.status(400).json({ message: 'Cannot assign technician to a resolved complaint' });
    }

    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    complaint.technicianId = technicianId;
    complaint.status = 'Technician Assigned';
    await complaint.save();
    await complaint.populate('technicianId', 'name phone serviceArea');

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

    if (complaint.status === 'Resolved') {
      return res.status(400).json({ message: 'Complaint is already resolved' });
    }

    complaint.status = 'Resolved';
    await complaint.save();
    await complaint.populate('technicianId', 'name phone serviceArea');

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/customers', authMiddleware, async (req, res) => {
  try {
    const { search, phone } = req.query;

    if (phone) {
      const cleanPhone = require('../utils/customerService.js').cleanPhone(phone);
      const customer = await Customer.findOne({ phone: cleanPhone });
      if (customer) {
        const complaints = await Complaint.find({ phone: cleanPhone }).sort({ createdAt: -1 });
        return res.json({ customer, complaints });
      }
      return res.json({ customer: null, complaints: [] });
    }

    const query = search
      ? { $text: { $search: search } }
      : {};

    const customers = await Customer.find(query).sort({ lastComplaintAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/customers/:phone/complaints', authMiddleware, async (req, res) => {
  try {
    const cleanPhone = require('../utils/customerService.js').cleanPhone(req.params.phone);
    const complaints = await Complaint.find({ phone: cleanPhone }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.use(uploadErrorHandler);

export default router;
