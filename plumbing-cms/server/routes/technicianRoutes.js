import express from 'express';
import Technician from '../models/Technician.js';
import Complaint from '../models/Complaint.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (_req, res) => {
  try {
    const technicians = await Technician.find().sort({ name: 1 });
    res.json(technicians);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, serviceArea } = req.body;
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const technician = await Technician.create({
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      serviceArea: serviceArea?.trim(),
    });

    res.status(201).json(technician);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, phone, serviceArea, isAvailable } = req.body;
    const update = {};

    if (name !== undefined) update.name = name.trim();
    if (phone !== undefined) update.phone = phone.replace(/\D/g, '');
    if (serviceArea !== undefined) update.serviceArea = serviceArea?.trim();
    if (isAvailable !== undefined) update.isAvailable = isAvailable;

    const technician = await Technician.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    res.json(technician);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const assigned = await Complaint.countDocuments({
      technicianId: req.params.id,
      status: 'Technician Assigned',
    });

    if (assigned > 0) {
      return res.status(400).json({
        message: 'Cannot delete technician with active assigned complaints',
      });
    }

    const technician = await Technician.findByIdAndDelete(req.params.id);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    res.json({ message: 'Technician deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
