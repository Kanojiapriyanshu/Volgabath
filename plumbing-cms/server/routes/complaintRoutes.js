import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Complaint from '../models/Complaint.js';
import { generateComplaintId } from '../utils/complaintId.js';
import { sendRegistrationMessage } from '../services/whatsappService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const PHONE_REGEX = /^[6-9]\d{9}$/;

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { customerName, phone, category, address, description } = req.body;

    if (!customerName?.trim()) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const cleanPhone = phone?.replace(/\D/g, '') || '';
    if (!PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({ message: 'Valid 10-digit Indian mobile number is required' });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;

    let complaint;
    for (let attempt = 0; attempt < 5; attempt++) {
      const complaintId = await generateComplaintId();
      try {
        complaint = await Complaint.create({
          complaintId,
          customerName: customerName.trim(),
          phone: cleanPhone,
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

    sendRegistrationMessage(complaint.customerName, complaint.phone, complaint.complaintId).catch(
      console.error
    );

    res.status(201).json({
      message: 'Complaint registered successfully',
      complaintId: complaint.complaintId,
    });
  } catch (err) {
    if (err.message === 'Only image files are allowed') {
      return res.status(400).json({ message: err.message });
    }
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

router.use((err, _req, res, next) => {
  if (err.message === 'Only image files are allowed' || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message,
    });
  }
  next(err);
});

export default router;
