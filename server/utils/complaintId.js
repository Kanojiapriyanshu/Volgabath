import Complaint from '../models/Complaint.js';

export async function generateComplaintId() {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const next = count + 1;
  const padded = String(next).padStart(4, '0');
  return `PLM-${year}-${padded}`;
}
