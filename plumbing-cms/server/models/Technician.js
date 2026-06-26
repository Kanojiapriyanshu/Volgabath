import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  serviceArea: String,
  isAvailable: { type: Boolean, default: true },
});

export default mongoose.model('Technician', technicianSchema);
