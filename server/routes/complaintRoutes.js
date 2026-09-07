import express from 'express';
import multer from 'multer';
import Complaint from '../models/Complaint.js';
import Customer from '../models/Customer.js';
import Technician from '../models/Technician.js';
import { generateComplaintId } from '../utils/complaintId.js';
import { upsertCustomer, cleanPhone, PHONE_REGEX } from '../utils/customerService.js';
import { upload, uploadErrorHandler } from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { customerName, phone, category, address, description } = req.body;

    if (!customerName?.trim()) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const clean = cleanPhone(phone);
    if (!PHONE_REGEX.test(clean)) {
      return res.status(400).json({ message: 'Valid 10-digit Indian mobile number is required' });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;

    await upsertCustomer({
      name: customerName.trim(),
      phone: clean,
      address: address?.trim(),
    });

    let complaint;
    for (let attempt = 0; attempt < 5; attempt++) {
      const complaintId = await generateComplaintId();
      try {
        complaint = await Complaint.create({
          complaintId,
          customerName: customerName.trim(),
          phone: clean,
          category: category || 'Other',
          address: address?.trim(),
          description: description?.trim(),
          photo,
        });
        break;
      } catch (err) {
        const isDupComplaintId = err.code === 11000 && err.keyPattern?.complaintId;
        if (!isDupComplaintId || attempt === 4) throw err;
      }
    }

    res.status(201).json({
      message: 'Complaint registered successfully',
      complaintId: complaint.complaintId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:complaintId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId.toUpperCase(),
    }).populate('technicianId', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      complaintId: complaint.complaintId,
      status: complaint.status,
      technicianName: complaint.technicianId?.name || null,
      createdAt: complaint.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.use(uploadErrorHandler);

export default router;
