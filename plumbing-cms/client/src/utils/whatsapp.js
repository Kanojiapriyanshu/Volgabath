export const COMPANY_NAME = 'Volga Metal Industries';
export const GOOGLE_REVIEW_LINK = 'https://g.page/r/CaMzETeAuL-8EBM/review';

export function formatPhoneForWaMe(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return digits;
  return digits;
}

export function openWhatsApp(phone, message) {
  const num = formatPhoneForWaMe(phone);
  const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function buildRegistrationMessage(customerName, complaintId) {
  return `Dear sir,

Thank you for contacting us. Your service request has been registered successfully.

Complaint ID: ${complaintId}

Our team will contact you shortly.

Best Regards,
${COMPANY_NAME}`;
}

export function buildAssignmentMessage(customerName, technicianName) {
  return `Dear sir,

A technician has been assigned to your service request.

Technician: ${technicianName}

He will contact you shortly.

Best Regards,
${COMPANY_NAME}`;
}

export function buildResolutionMessage(customerName, complaintId) {
  return `Dear sir,

We are pleased to inform you that your service request has been completely resolved.

Complaint ID: ${complaintId}

Status: Resolved

Kindly leave us a Google review:

${GOOGLE_REVIEW_LINK}

Best Regards,
${COMPANY_NAME}`;
}

export function getMessageForComplaint(complaint) {
  const { customerName, phone, complaintId, status, technicianId } = complaint;

  if (status === 'Resolved') {
    return { phone, message: buildResolutionMessage(customerName, complaintId) };
  }
  if (status === 'Technician Assigned' && technicianId) {
    return {
      phone,
      message: buildAssignmentMessage(
        customerName,
        technicianId.name
      ),
    };
  }
  return { phone, message: buildRegistrationMessage(customerName, complaintId) };
}

export function sendWhatsAppForComplaint(complaint) {
  const { phone, message } = getMessageForComplaint(complaint);
  openWhatsApp(phone, message);
}
