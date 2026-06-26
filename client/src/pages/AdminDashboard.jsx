import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addTechnician,
  deleteTechnician,
  getComplaints,
  getTechnicians,
  resolveComplaint,
  updateTechnician,
  getCustomerByPhone,
} from '../api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { WhatsAppActionButton } from '../components/WhatsAppButton';
import AdminManualComplaintForm from '../components/AdminManualComplaintForm';

const STATUS_OPTIONS = ['', 'New Request', 'Technician Assigned', 'Resolved'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [techForm, setTechForm] = useState({ name: '', phone: '', serviceArea: '' });
  const [techError, setTechError] = useState('');
  const [customerData, setCustomerData] = useState({});

  const loadComplaints = useCallback(async () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (dateFilter) params.date = dateFilter;
    if (search.trim()) params.search = search.trim();
    const data = await getComplaints(params);
    setComplaints(data);
  }, [statusFilter, dateFilter, search]);

  const loadTechnicians = async () => {
    const data = await getTechnicians();
    setTechnicians(data);
  };

  const loadCustomerData = async (phoneNumbers) => {
    const customerMap = {};
    await Promise.all(
      phoneNumbers.map(async (phone) => {
        try {
          const data = await getCustomerByPhone(phone);
          if (data.customer) {
            customerMap[phone] = data.customer;
          }
        } catch (err) {
          console.error('Error loading customer data for', phone, err);
        }
      })
    );
    setCustomerData(customerMap);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [all] = await Promise.all([getComplaints(), loadTechnicians()]);
        setAllComplaints(all);
        await loadComplaints();
        
        const uniquePhones = [...new Set(all.map(c => c.phone))];
        await loadCustomerData(uniquePhones);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) loadComplaints();
  }, [statusFilter, dateFilter]);

  const stats = {
    total: allComplaints.length,
    new: allComplaints.filter((c) => c.status === 'New Request').length,
    assigned: allComplaints.filter((c) => c.status === 'Technician Assigned').length,
    resolved: allComplaints.filter((c) => c.status === 'Resolved').length,
  };

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    setTechError('');
    try {
      await addTechnician(techForm);
      setTechForm({ name: '', phone: '', serviceArea: '' });
      await loadTechnicians();
    } catch (err) {
      setTechError(err.message);
    }
  };

  const toggleAvailability = async (tech) => {
    try {
      await updateTechnician(tech._id, { isAvailable: !tech.isAvailable });
      await loadTechnicians();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTech = async (id) => {
    if (!confirm('Delete this technician?')) return;
    try {
      await deleteTechnician(id);
      await loadTechnicians();
    } catch (err) {
      alert(err.message);
    }
  };

  const refreshComplaints = async () => {
    await loadComplaints();
    const all = await getComplaints();
    setAllComplaints(all);
    
    const uniquePhones = [...new Set(all.map(c => c.phone))];
    await loadCustomerData(uniquePhones);
  };

  const handleResolve = async (complaintId) => {
    if (!confirm('Mark this complaint as resolved?')) return;
    try {
      await resolveComplaint(complaintId);
      await refreshComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  const renderActions = (c) => (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/admin/complaints/${c._id}`}
        className="rounded-lg bg-orange/10 px-3 py-1.5 text-sm font-medium text-orange hover:bg-orange/20"
      >
        View
      </Link>
      {c.status === 'New Request' && (
        <Link
          to={`/admin/complaints/${c._id}`}
          className="rounded-lg bg-navy/10 px-3 py-1.5 text-sm font-medium text-navy hover:bg-navy/20"
        >
          Assign
        </Link>
      )}
      {c.status !== 'Resolved' && (
        <button
          type="button"
          onClick={() => handleResolve(c._id)}
          className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200"
        >
          Mark Resolved
        </button>
      )}
      <WhatsAppActionButton complaint={c} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'complaints' && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Total Requests" value={stats.total} color="blue" />
              <StatCard label="New Requests" value={stats.new} color="orange" />
              <StatCard label="Assigned" value={stats.assigned} color="yellow" />
              <StatCard label="Resolved" value={stats.resolved} color="green" />
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.filter(Boolean).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="mb-1 block text-xs font-medium text-gray-500">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-[2] min-w-[180px]">
                <label className="mb-1 block text-xs font-medium text-gray-500">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or Complaint ID..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={loadComplaints}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90"
              >
                Apply Filters
              </button>
            </div>

            {loading ? (
              <div className="mt-12 flex justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="mt-6 hidden overflow-x-auto rounded-xl bg-white shadow-sm md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Complaint ID</th>
                        <th className="px-4 py-3">Customer Name</th>
                        <th className="px-4 py-3">Phone Number</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {complaints.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No complaints found
                          </td>
                        </tr>
                      ) : (
                        complaints.map((c) => (
                          <tr key={c._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-navy">{c.complaintId}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {c.customerName}
                                {customerData[c.phone]?.complaintCount > 0 && (
                                  <span className="text-xs bg-orange/10 text-orange px-2 py-0.5 rounded-full">
                                    {customerData[c.phone].complaintCount}x
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">{c.phone}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={c.status} />
                            </td>
                            <td className="px-4 py-3">{renderActions(c)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="mt-6 space-y-4 md:hidden">
                  {complaints.length === 0 ? (
                    <p className="text-center text-gray-500">No complaints found</p>
                  ) : (
                    complaints.map((c) => (
                      <div key={c._id} className="rounded-xl bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy">{c.complaintId}</span>
                            {customerData[c.phone]?.complaintCount > 0 && (
                              <span className="text-xs bg-orange/10 text-orange px-2 py-0.5 rounded-full">
                                {customerData[c.phone].complaintCount}x
                              </span>
                            )}
                          </div>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="mt-2 font-medium">{c.customerName}</p>
                        <p className="text-sm text-gray-500">{c.phone}</p>
                        <div className="mt-4">{renderActions(c)}</div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'add-complaint' && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold text-navy">Register Phone / Manual Complaint</h2>
              <p className="mt-1 text-sm text-gray-600">
                For complaints received by phone. Search recurring customers or add a new one.
                Technician assignment is optional.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <AdminManualComplaintForm
                technicians={technicians}
                onSuccess={refreshComplaints}
              />
            </div>
          </div>
        )}

        {activeTab === 'technicians' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold text-navy">Add Technician</h2>
              {techError && (
                <p className="mt-2 text-sm text-red-600">{techError}</p>
              )}
              <form onSubmit={handleAddTechnician} className="mt-4 space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={techForm.name}
                  onChange={(e) => setTechForm({ ...techForm, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={techForm.phone}
                  onChange={(e) => setTechForm({ ...techForm, phone: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Service Area"
                  value={techForm.serviceArea}
                  onChange={(e) => setTechForm({ ...techForm, serviceArea: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-orange py-2 font-medium text-white hover:bg-orange/90"
                >
                  Add Technician
                </button>
              </form>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold text-navy">All Technicians</h2>
              <ul className="mt-4 divide-y">
                {technicians.length === 0 ? (
                  <li className="py-4 text-center text-gray-500">No technicians yet</li>
                ) : (
                  technicians.map((t) => (
                    <li key={t._id} className="flex flex-wrap items-center justify-between gap-2 py-4">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-gray-500">
                          {t.phone} · {t.serviceArea || 'All areas'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAvailability(t)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            t.isAvailable
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {t.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTech(t._id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
