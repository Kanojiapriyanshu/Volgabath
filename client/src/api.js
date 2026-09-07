const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function submitComplaint(formData) {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit complaint');
  return data;
}

export async function trackComplaint(complaintId) {
  const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(complaintId)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Complaint not found');
  return data;
}

export async function adminLogin(email, password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function getComplaints(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/complaints?${qs}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch complaints');
  return data;
}

export async function getComplaint(id) {
  const res = await fetch(`${API_BASE}/admin/complaints/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch complaint');
  return data;
}

export async function assignTechnician(complaintId, technicianId) {
  const res = await fetch(`${API_BASE}/admin/complaints/${complaintId}/assign`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ technicianId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to assign technician');
  return data;
}

export async function resolveComplaint(complaintId) {
  const res = await fetch(`${API_BASE}/admin/complaints/${complaintId}/resolve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to resolve complaint');
  return data;
}

export async function getTechnicians() {
  const res = await fetch(`${API_BASE}/admin/technicians`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch technicians');
  return data;
}

export async function addTechnician(payload) {
  const res = await fetch(`${API_BASE}/admin/technicians`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add technician');
  return data;
}

export async function updateTechnician(id, payload) {
  const res = await fetch(`${API_BASE}/admin/technicians/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update technician');
  return data;
}

export async function deleteTechnician(id) {
  const res = await fetch(`${API_BASE}/admin/technicians/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete technician');
  return data;
}

export async function getAllCustomers() {
  const res = await fetch(`${API_BASE}/admin/customers?all=true`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch customers');
  return data;
}

export async function searchCustomers(search = '') {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/admin/customers${qs}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to search customers');
  return data;
}

export async function createAdminComplaint(formData) {
  const res = await fetch(`${API_BASE}/admin/complaints`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create complaint');
  return data;
}

export async function deleteComplaint(id) {
  const res = await fetch(`${API_BASE}/admin/complaints/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete complaint');
  return data;
}

export async function getCustomerByPhone(phone) {
  const qs = `?phone=${encodeURIComponent(phone)}`;
  const res = await fetch(`${API_BASE}/admin/customers${qs}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to get customer');
  return data;
}

export async function getCustomerComplaints(phone) {
  const res = await fetch(`${API_BASE}/admin/customers/${encodeURIComponent(phone)}/complaints`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to get customer complaints');
  return data;
}
