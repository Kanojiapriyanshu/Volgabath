import express from 'express';
import Customer from '../models/Customer.js';
import Complaint from '../models/Complaint.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { cleanPhone } from '../utils/customerService.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { search, phone } = req.query;

    if (phone) {
      const cleanedPhone = cleanPhone(phone);
      const customer = await Customer.findOne({ phone: cleanedPhone });
      if (customer) {
        const complaints = await Complaint.find({ phone: cleanedPhone }).sort({ createdAt: -1 });
        return res.json({ customer, complaints });
      }
      return res.json({ customer: null, complaints: [] });
    }

    const filter = {};

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { phone: regex }];
    }

    const customers = await Customer.find(filter)
      .sort({ lastComplaintAt: -1 })
      .limit(20);

    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:phone/complaints', async (req, res) => {
  try {
    const cleanedPhone = cleanPhone(req.params.phone);
    const complaints = await Complaint.find({ phone: cleanedPhone }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
