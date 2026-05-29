import twilio from 'twilio';

let client = null;

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || sid === 'your_twilio_sid' || token === 'your_twilio_token') {
    return null;
  }
  if (!client) {
    client = twilio(sid, token);
  }
  return client;
}

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `whatsapp:+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `whatsapp:+${digits}`;
  if (digits.startsWith('+')) return `whatsapp:${digits}`;
  return `whatsapp:+${digits}`;
}

async function sendWhatsApp(to, body) {
  const twilioClient = getClient();
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!twilioClient || !from) {
    console.log('[WhatsApp - not configured]');
    console.log(`To: ${to}`);
    console.log(body);
    console.log('---');
    return;
  }

  try {
    await twilioClient.messages.create({
      from,
      to: formatPhone(to),
      body,
    });
  } catch (err) {
    console.error('[WhatsApp send error]', err.message);
    console.log('[WhatsApp fallback log]');
    console.log(`To: ${to}`);
    console.log(body);
  }
}

export async function sendRegistrationMessage(customerName, phone, complaintId) {
  const body = `Dear ${customerName},
Thank you for contacting us.
Your service request has been registered successfully.
Complaint ID: ${complaintId}
Our team will contact you shortly.`;

  await sendWhatsApp(phone, body);
}

export async function sendAssignmentMessage(
  customerName,
  phone,
  technicianName,
  technicianPhone
) {
  const body = `Dear ${customerName},
A technician has been assigned to your service request.
Technician: ${technicianName}
Contact: ${technicianPhone}
He will contact you shortly.`;

  await sendWhatsApp(phone, body);
}

export async function sendResolutionMessage(customerName, phone, complaintId) {
  const googleReviewLink =
    process.env.GOOGLE_REVIEW_LINK || 'https://g.page/r/your-review-link';

  const body1 = `Dear ${customerName},
Your service request has been completed successfully.
Complaint ID: ${complaintId}
Status: Resolved
We hope you are satisfied with our service.`;

  await sendWhatsApp(phone, body1);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const body2 = `Dear ${customerName},
Thank you for choosing our service.
If you are satisfied with the work, please share your feedback:
${googleReviewLink}
Your feedback means a lot to us.`;

  await sendWhatsApp(phone, body2);
}
