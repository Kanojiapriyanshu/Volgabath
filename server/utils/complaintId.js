import Complaint from '../models/Complaint.js';

export async function generateComplaintId() {
  const year = new Date().getFullYear();
  const prefix = `PLM-${year}-`;

  const last = await Complaint.findOne({
    complaintId: { $regex: `^${prefix}` },
  })
    .sort({ complaintId: -1 })
    .lean();

  let next = 1;
  if (last) {
    const lastNum = parseInt(last.complaintId.slice(prefix.length), 10);
    if (!Number.isNaN(lastNum)) next = lastNum + 1;
  }

  const padded = String(next).padStart(4, '0');
  return `${prefix}${padded}`;
}
