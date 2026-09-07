import Customer from '../models/Customer.js';

export const PHONE_REGEX = /^[6-9]\d{9}$/;

export function cleanPhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export async function upsertCustomer({ name, phone, address }) {
  const clean = cleanPhone(phone);
  if (!PHONE_REGEX.test(clean)) {
    throw new Error('Valid 10-digit Indian mobile number is required');
  }

  const customer = await Customer.findOneAndUpdate(
    { phone: clean },
    {
      $set: {
        name: name.trim(),
        ...(address?.trim() ? { address: address.trim() } : {}),
        lastComplaintAt: new Date(),
      },
      $inc: { complaintCount: 1 },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, new: true }
  );

  return customer;
}

export async function syncCustomersFromComplaints() {
  const Complaint = (await import('../models/Complaint.js')).default;
  const complaints = await Complaint.find().sort({ createdAt: 1 });

  for (const c of complaints) {
    const clean = cleanPhone(c.phone);
    if (!PHONE_REGEX.test(clean)) continue;

    await Customer.findOneAndUpdate(
      { phone: clean },
      {
        $set: {
          name: c.customerName,
          ...(c.address ? { address: c.address } : {}),
          lastComplaintAt: c.createdAt,
        },
        $inc: { complaintCount: 1 },
        $setOnInsert: { createdAt: c.createdAt },
      },
      { upsert: true }
    );
  }
}
