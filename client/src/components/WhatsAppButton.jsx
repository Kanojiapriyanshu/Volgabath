import { sendWhatsAppForComplaint, buildResolutionMessage, openWhatsApp } from '../utils/whatsapp';

export function WhatsAppActionButton({ complaint, className = '', label = 'Send WhatsApp' }) {
  return (
    <button
      type="button"
      onClick={() => sendWhatsAppForComplaint(complaint)}
      className={`inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#20bd5a] ${className}`}
    >
      <span aria-hidden>💬</span>
      {label}
    </button>
  );
}

export function ResolutionWhatsAppButton({ complaint, className = '' }) {
  const handleClick = () => {
    const message = buildResolutionMessage(complaint.customerName, complaint.complaintId);
    openWhatsApp(complaint.phone, message);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-heading text-base font-bold text-white shadow-lg hover:bg-[#20bd5a] sm:w-auto ${className}`}
    >
      <span aria-hidden>✓</span>
      Send Resolution Message
    </button>
  );
}
