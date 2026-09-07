import { useEffect, useState } from 'react';
import { createAdminComplaint, searchCustomers, getCustomerByPhone } from '../api';

const CATEGORIES = [
  'Water Leakage',
  'Pipe Burst',
  'Drainage Block',
  'Tap/Faucet Issue',
  'Water Tank Problem',
  'Toilet/Flush Issue',
  'Other',
];

const emptyForm = {
  customerName: '',
  phone: '',
  category: 'Other',
  address: '',
  description: '',
  technicianId: '',
};

export default function AdminManualComplaintForm({ technicians, onSuccess }) {
  const [mode, setMode] = useState('existing');
  const [form, setForm] = useState(emptyForm);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  useEffect(() => {
    if (mode !== 'existing') return;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchCustomers(customerSearch);
        setCustomers(results);
      } catch {
        setCustomers([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch, mode]);

  useEffect(() => {
    if (mode !== 'new' || !form.phone || form.phone.length < 10) {
      setFoundCustomer(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const data = await getCustomerByPhone(form.phone);
        setFoundCustomer(data);
      } catch {
        setFoundCustomer(null);
      } finally {
        setCheckingPhone(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.phone, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectCustomer = (customer) => {
    setSelectedCustomerId(customer._id);
    setForm({
      ...emptyForm,
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address || '',
    });
    setCustomerSearch(`${customer.name} — ${customer.phone}`);
    setCustomers([]);
    setFoundCustomer(null);
  };

  const useFoundCustomer = () => {
    if (foundCustomer?.customer) {
      setMode('existing');
      selectCustomer(foundCustomer.customer);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setForm(emptyForm);
    setSelectedCustomerId('');
    setCustomerSearch('');
    setCustomers([]);
    setFoundCustomer(null);
    setError('');
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = new FormData();
      if (mode === 'existing' && selectedCustomerId) {
        payload.append('customerId', selectedCustomerId);
      }
      payload.append('customerName', form.customerName);
      payload.append('phone', form.phone);
      payload.append('category', form.category);
      if (form.address) payload.append('address', form.address);
      if (form.description) payload.append('description', form.description);
      if (form.technicianId) payload.append('technicianId', form.technicianId);

      const complaint = await createAdminComplaint(payload);
      setSuccess(complaint);
      setForm(emptyForm);
      setSelectedCustomerId('');
      setCustomerSearch('');
      onSuccess?.(complaint);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <h3 className="font-heading text-lg font-bold text-green-800">Complaint Added!</h3>
        <p className="mt-2 text-navy">
          Complaint ID: <strong>{success.complaintId}</strong>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Customer: {success.customerName} · {success.phone}
        </p>
        <p className="mt-1 text-sm text-gray-600">Status: {success.status}</p>
        <button
          type="button"
          onClick={() => setSuccess(null)}
          className="mt-4 text-sm font-medium text-orange hover:underline"
        >
          Add another complaint
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => switchMode('existing')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            mode === 'existing' ? 'bg-white text-navy shadow' : 'text-gray-600'
          }`}
        >
          Recurring Customer
        </button>
        <button
          type="button"
          onClick={() => switchMode('new')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            mode === 'new' ? 'bg-white text-navy shadow' : 'text-gray-600'
          }`}
        >
          New Customer
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {mode === 'existing' && (
        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Find Customer
          </label>
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setSelectedCustomerId('');
            }}
            placeholder="Search by name or phone..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          />
          {searching && (
            <p className="mt-1 text-xs text-gray-400">Searching...</p>
          )}
          {customers.length > 0 && !selectedCustomerId && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-white shadow-lg">
              {customers.map((c) => (
                <li key={c._id}>
                  <button
                    type="button"
                    onClick={() => selectCustomer(c)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-orange/5"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-gray-500"> · {c.phone}</span>
                    {c.complaintCount > 0 && (
                      <span className="ml-2 text-xs text-orange">
                        {c.complaintCount} past complaint{c.complaintCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {c.lastComplaintAt && (
                      <span className="ml-2 text-xs text-gray-400">
                        Last: {new Date(c.lastComplaintAt).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedCustomerId && (
            <p className="mt-2 text-xs text-green-700">✓ Customer selected — details filled below</p>
          )}
        </div>
      )}

      {mode === 'new' && (foundCustomer?.customer || checkingPhone) && (
        <div className="rounded-lg border p-4">
          {checkingPhone ? (
            <p className="text-sm text-gray-500">Checking for existing customer...</p>
          ) : foundCustomer?.customer ? (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange">⚠️ Existing Customer Found!</p>
                  <p className="text-sm text-gray-600">
                    {foundCustomer.customer.name} · {foundCustomer.customer.phone}
                  </p>
                  {foundCustomer.customer.complaintCount > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {foundCustomer.customer.complaintCount} past complaint{foundCustomer.customer.complaintCount > 1 ? 's' : ''}
                      {foundCustomer.customer.lastComplaintAt && (
                        <> · Last: {new Date(foundCustomer.customer.lastComplaintAt).toLocaleDateString('en-IN')}</>
                      )}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={useFoundCustomer}
                  className="rounded-lg bg-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange/90"
                >
                  Use This Customer
                </button>
              </div>
              {foundCustomer.complaints?.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-gray-700 mb-2">Recent Complaints:</p>
                  <ul className="space-y-1">
                    {foundCustomer.complaints.slice(0, 3).map((c) => (
                      <li key={c._id} className="text-xs text-gray-600">
                        {c.complaintId} · {c.category} · {new Date(c.createdAt).toLocaleDateString('en-IN')} · <span className={c.status === 'Resolved' ? 'text-green-600' : 'text-orange'}>{c.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            required
            value={form.customerName}
            onChange={handleChange}
            readOnly={mode === 'existing' && !!selectedCustomerId}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            required
            maxLength={10}
            value={form.phone}
            onChange={handleChange}
            readOnly={mode === 'existing' && !!selectedCustomerId}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm disabled:bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
        <textarea
          name="address"
          rows={2}
          value={form.address}
          onChange={handleChange}
          placeholder="Customer address"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Issue Description</label>
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the complaint (phone call notes)..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Assign Technician <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <select
          name="technicianId"
          value={form.technicianId}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
        >
          <option value="">No technician — assign later</option>
          {technicians
            .filter((t) => t.isAvailable)
            .map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} — {t.serviceArea || 'All areas'}
              </option>
            ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || (mode === 'existing' && !selectedCustomerId)}
        className="w-full rounded-xl bg-orange py-3 font-heading font-bold text-white hover:bg-orange/90 disabled:opacity-60"
      >
        {loading ? 'Registering...' : 'Register Complaint →'}
      </button>

      {mode === 'existing' && !selectedCustomerId && (
        <p className="text-center text-xs text-gray-500">
          Search and select a customer, or switch to &quot;New Customer&quot; tab
        </p>
      )}
    </form>
  );
}
