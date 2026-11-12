const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Properties
  getProperties: async () => {
    const res = await fetch(`${API_BASE_URL}/properties`);
    return await res.json();
  },
  createProperty: async (propData) => {
    const res = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propData)
    });
    return await res.json();
  },

  // Rooms
  getRooms: async (propertyId) => {
    const url = propertyId ? `${API_BASE_URL}/rooms?propertyId=${propertyId}` : `${API_BASE_URL}/rooms`;
    const res = await fetch(url);
    return await res.json();
  },
  createRoom: async (roomData) => {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });
    return await res.json();
  },

  // Tenants
  getTenants: async (propertyId) => {
    const url = propertyId ? `${API_BASE_URL}/tenants?propertyId=${propertyId}` : `${API_BASE_URL}/tenants`;
    const res = await fetch(url);
    return await res.json();
  },
  createTenant: async (tenantData) => {
    const res = await fetch(`${API_BASE_URL}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenantData)
    });
    return await res.json();
  },
  removeTenant: async (tenantId) => {
    const res = await fetch(`${API_BASE_URL}/tenants/${tenantId}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // Payments
  getPayments: async (propertyId, status) => {
    let url = `${API_BASE_URL}/payments`;
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    return await res.json();
  },
  processCheckout: async ({ paymentId, paymentMethod, notes }) => {
    const res = await fetch(`${API_BASE_URL}/payments/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, paymentMethod, notes })
    });
    return await res.json();
  },

  // Complaints
  getComplaints: async (propertyId, status) => {
    let url = `${API_BASE_URL}/complaints`;
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    return await res.json();
  },
  createComplaint: async (complaintData) => {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData)
    });
    return await res.json();
  },
  updateComplaintStatus: async (complaintId, status, assignedTo, resolutionNotes) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, assignedTo, resolutionNotes })
    });
    return await res.json();
  },

  // Notices
  getNotices: async (propertyId) => {
    const url = propertyId ? `${API_BASE_URL}/notices?propertyId=${propertyId}` : `${API_BASE_URL}/notices`;
    const res = await fetch(url);
    return await res.json();
  },
  createNotice: async (noticeData) => {
    const res = await fetch(`${API_BASE_URL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticeData)
    });
    return await res.json();
  },
  deleteNotice: async (noticeId) => {
    const res = await fetch(`${API_BASE_URL}/notices/${noticeId}`, {
      method: 'DELETE'
    });
    return await res.json();
  }
};
