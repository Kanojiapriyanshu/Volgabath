import { useState } from 'react';
import { submitComplaint } from '../api';

const CATEGORIES = [
  'Water Leakage',
  'Pipe Burst',
  'Drainage Block',
  'Tap/Faucet Issue',
  'Water Tank Problem',
  'Toilet/Flush Issue',
  'Other',
];

export default function ComplaintForm() {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    category: 'Other',
    address: '',
    description: '',
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('customerName', form.customerName);
      fd.append('phone', form.phone);
      fd.append('category', form.category);
      if (form.address) fd.append('address', form.address);
      if (form.description) fd.append('description', form.description);
      if (photo) fd.append('photo', photo);

      const result = await submitComplaint(fd);
      setSuccess(result.complaintId);
      setForm({
        customerName: '',
        phone: '',
        category: 'Other',
        address: '',
        description: '',
      });
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center shadow-lg">
        <div className="text-4xl">✅</div>
        <h3 className="mt-2 font-heading text-xl font-bold text-green-800">
          Complaint Registered!
        </h3>
        <p className="mt-2 text-lg font-semibold text-navy">Complaint ID: {success}</p>
        <p className="mt-2 text-sm text-gray-600">
          Our team will contact you shortly. Save your Complaint ID for reference.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(null)}
          className="mt-4 text-sm font-medium text-orange hover:underline"
        >
          Submit another complaint
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="customerName"
          required
          value={form.customerName}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          placeholder="Your full name"
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
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          placeholder="10-digit mobile number"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Complaint Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
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
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          placeholder="Your address"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          placeholder="Describe your issue..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Upload Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-orange file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange/90"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 h-24 w-24 rounded-lg border object-cover shadow"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange py-4 font-heading text-base font-bold text-white shadow-lg transition hover:bg-orange/90 disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Submitting...
          </>
        ) : (
          'Submit Complaint →'
        )}
      </button>
    </form>
  );
}
