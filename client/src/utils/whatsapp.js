export const COMPANY_NAME = 'Volga Plumbing Services';
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
  return `Dear ${customerName},

Thank you for contacting us.
Your service request has been registered successfully.

Complaint ID: ${complaintId}

Our team will contact you shortly.

Best Regards,
${COMPANY_NAME}`;
}

export function buildAssignmentMessage(customerName, technicianName, technicianPhone) {
  return `Dear ${customerName},

A technician has been assigned to your service request.

Technician: ${technicianName}
Contact: ${technicianPhone}

He will contact you shortly.

Best Regards,
${COMPANY_NAME}`;
}

export function buildResolutionMessage(customerName, complaintId) {
  return `Dear ${customerName},

We are pleased to inform you that your service request has been completed successfully.

Complaint ID: ${complaintId}

Status: Resolved

Our technician has completed the required work. We hope the issue has been resolved to your satisfaction.

We would greatly appreciate your feedback. If you are satisfied with our service, kindly leave us a Google Review:

${GOOGLE_REVIEW_LINK}

Thank you for choosing ${COMPANY_NAME}.

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
        technicianId.name,
        technicianId.phone
      ),
    };
  }
  return { phone, message: buildRegistrationMessage(customerName, complaintId) };
}

export function sendWhatsAppForComplaint(complaint) {
  const { phone, message } = getMessageForComplaint(complaint);
  openWhatsApp(phone, message);
}
