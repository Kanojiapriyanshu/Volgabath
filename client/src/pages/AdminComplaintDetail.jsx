import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  assignTechnician,
  getComplaint,
  getTechnicians,
  resolveComplaint,
  getCustomerByPhone,
  deleteComplaint,
} from '../api';
import StatusBadge from '../components/StatusBadge';
import { WhatsAppActionButton, ResolutionWhatsAppButton } from '../components/WhatsAppButton';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);

  const load = async () => {
    try {
      const [c, t] = await Promise.all([getComplaint(id), getTechnicians()]);
      setComplaint(c);
      setTechnicians(t.filter((tech) => tech.isAvailable));
      
      if (c?.phone) {
        const customerData = await getCustomerByPhone(c.phone);
        setCustomerInfo(customerData);
      }
    } catch (err) {
      if (err.message === 'Unauthorized' || err.message?.includes('token')) {
        navigate('/admin/login');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedTech) return;
    setActionLoading(true);
    setError('');
    try {
      const updated = await assignTechnician(id, selectedTech);
      setComplaint(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    setActionLoading(true);
    setError('');
    try {
      const updated = await resolveComplaint(id);
      setComplaint(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await deleteComplaint(id);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const timeline = [
    { label: 'Complaint Registered', date: complaint?.createdAt, done: true },
    {
      label: 'Technician Assigned',
      date: complaint?.status !== 'New Request' ? complaint?.updatedAt : null,
      done: complaint?.status === 'Technician Assigned' || complaint?.status === 'Resolved',
    },
    {
      label: 'Resolved',
      date: complaint?.status === 'Resolved' ? complaint?.updatedAt : null,
      done: complaint?.status === 'Resolved',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy border-t-transparent" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error || 'Complaint not found'}</p>
        <Link to="/admin/dashboard" className="mt-4 text-orange hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-navy"
            >
              ← Back
            </Link>
            <h1 className="font-heading text-lg font-bold text-navy">{complaint.complaintId}</h1>
            <StatusBadge status={complaint.status} />
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {complaint.status === 'Resolved' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center font-semibold text-green-800">
              ✅ This complaint has been resolved
            </div>
            <div className="rounded-xl border border-green-200 bg-white p-6 text-center shadow-sm">
              <p className="mb-4 text-sm text-gray-600">
                Send the resolution message via WhatsApp — the message is pre-filled. You only
                need to press Send.
              </p>
              <ResolutionWhatsAppButton complaint={complaint} />
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-xl bg-white p-6 shadow-sm md:col-span-1">
            <h2 className="font-heading font-semibold text-navy">Customer Details</h2>
            {customerInfo?.customer && (
              <div className="mb-4 rounded-lg bg-orange/5 p-3 border border-orange/20">
                <p className="text-sm font-medium text-orange">
                  {customerInfo.customer.complaintCount > 0 
                    ? `Repeat Customer (${customerInfo.customer.complaintCount} complaints)` 
                    : 'Existing Customer'}
                </p>
                {customerInfo.customer.lastComplaintAt && (
                  <p className="text-xs text-gray-600 mt-1">
                    Last complaint: {formatDate(customerInfo.customer.lastComplaintAt)}
                  </p>
                )}
              </div>
            )}
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium">{complaint.customerName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Mobile</dt>
                <dd className="font-medium">{complaint.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium">{complaint.category}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Address</dt>
                <dd className="font-medium">{complaint.address || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Description</dt>
                <dd className="font-medium">{complaint.description || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Submitted</dt>
                <dd className="font-medium">{formatDate(complaint.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm md:col-span-1">
            <h2 className="font-heading font-semibold text-navy">Customer History</h2>
            {customerInfo?.complaints?.length > 0 ? (
              <ul className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                {customerInfo.complaints.map((c) => (
                  <li key={c._id} className="text-sm border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-navy">{c.complaintId}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">{c.category} · {formatDate(c.createdAt)}</p>
                    {c.description && <p className="text-gray-500 text-xs mt-1">{c.description}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-4">No prior complaints</p>
            )}
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm md:col-span-1">
            <h2 className="font-heading font-semibold text-navy">Status Timeline</h2>
            <ol className="mt-4 space-y-4">
              {timeline.map((step, i) => (
                <li key={step.label} className="flex gap-3">
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.done ? '✓' : i + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${step.done ? 'text-navy' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {complaint.photo && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Uploaded Photo</h3>
                <img
                  src={complaint.photo}
                  alt="Complaint"
                  className="mt-2 max-h-48 rounded-lg border object-cover"
                />
              </div>
            )}
          </section>
        </div>

        {complaint.status === 'New Request' && (
          <section className="rounded-xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="font-heading font-semibold text-navy">Assign Technician (optional)</h2>
            <p className="mt-1 text-sm text-gray-600">
              Assign now or skip and resolve later when work is done.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2"
              >
                <option value="">Select technician...</option>
                {technicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} — {t.serviceArea || 'All areas'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedTech || actionLoading}
                className="rounded-lg bg-navy px-6 py-2 font-medium text-white hover:bg-navy/90 disabled:opacity-50"
              >
                {actionLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
            <div className="mt-6 border-t border-orange-200 pt-4">
              <button
                type="button"
                onClick={handleResolve}
                disabled={actionLoading}
                className="rounded-lg border border-green-600 bg-white px-6 py-2 font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                Mark as Resolved (without technician)
              </button>
            </div>
          </section>
        )}

        {complaint.status === 'Technician Assigned' && complaint.technicianId && (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-heading font-semibold text-navy">Assigned Technician</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium">{complaint.technicianId.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Service Area</dt>
                <dd className="font-medium">{complaint.technicianId.serviceArea || '—'}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleResolve}
                disabled={actionLoading}
                className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Mark as Resolved'}
              </button>
            </div>
          </section>
        )}

        {complaint.status !== 'Resolved' && (
          <section className="rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 p-6">
            <h2 className="font-heading font-semibold text-navy">WhatsApp Message</h2>
            <p className="mt-2 text-sm text-gray-600">
              Opens WhatsApp Web or the app with a pre-filled message. Review and press Send.
            </p>
            <div className="mt-4">
              <WhatsAppActionButton complaint={complaint} className="px-6 py-3" />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
