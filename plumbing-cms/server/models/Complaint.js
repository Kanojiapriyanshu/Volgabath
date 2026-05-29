import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Water Leakage',
      'Pipe Burst',
      'Drainage Block',
      'Tap/Faucet Issue',
      'Water Tank Problem',
      'Toilet/Flush Issue',
      'Other',
    ],
    default: 'Other',
  },
  address: String,
  description: String,
  photo: String,
  status: {
    type: String,
    enum: ['New Request', 'Technician Assigned', 'Resolved'],
    default: 'New Request',
  },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Complaint', complaintSchema);
