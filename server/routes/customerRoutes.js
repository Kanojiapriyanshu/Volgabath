import express from 'express';
import Customer from '../models/Customer.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
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

export default router;
