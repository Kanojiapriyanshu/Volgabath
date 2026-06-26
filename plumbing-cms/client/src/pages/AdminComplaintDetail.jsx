import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  assignTechnician,
  getComplaint,
  getTechnicians,
  resolveComplaint,
} from '../api';
import StatusBadge from '../components/StatusBadge';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [c, t] = await Promise.all([getComplaint(id), getTechnicians()]);
      setComplaint(c);
      setTechnicians(t.filter((tech) => tech.isAvailable));
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
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Link
            to="/admin/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-navy"
          >
            ← Back
          </Link>
          <h1 className="font-heading text-lg font-bold text-navy">{complaint.complaintId}</h1>
          <StatusBadge status={complaint.status} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {complaint.status === 'Resolved' && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center font-semibold text-green-800">
            ✅ This complaint has been resolved
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-heading font-semibold text-navy">Customer Details</h2>
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

          <section className="rounded-xl bg-white p-6 shadow-sm">
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
            <h2 className="font-heading font-semibold text-navy">Assign Technician</h2>
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
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium">{complaint.technicianId.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Service Area</dt>
                <dd className="font-medium">{complaint.technicianId.serviceArea || '—'}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={handleResolve}
              disabled={actionLoading}
              className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : 'Mark as Resolved'}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
