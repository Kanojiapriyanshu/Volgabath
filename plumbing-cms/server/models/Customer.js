import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: String,
  complaintCount: { type: Number, default: 0 },
  lastComplaintAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

customerSchema.index({ name: 'text', phone: 'text' });

export default mongoose.model('Customer', customerSchema);
