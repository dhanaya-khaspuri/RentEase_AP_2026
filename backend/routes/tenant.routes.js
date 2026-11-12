import { Router } from 'express';

const router = Router();

let tenants = [
  { id: "usr_tenant_1", name: "Aarav Sharma", email: "aarav.tenant@rentease.com", phone: "+91 98111 22334", propertyId: "prop_1", roomId: "room_101", joinedDate: "2024-07-01", leaseEnd: "2025-06-30", monthlyRent: 8000, deposit: 16000, status: "active" },
  { id: "usr_tenant_2", name: "Rohan Gupta", email: "rohan.g@rentease.com", phone: "+91 98222 33445", propertyId: "prop_1", roomId: "room_101", joinedDate: "2024-07-10", leaseEnd: "2025-06-30", monthlyRent: 8000, deposit: 16000, status: "active" },
  { id: "usr_tenant_3", name: "Priyansh Verma", email: "priyansh.v@rentease.com", phone: "+91 98333 44556", propertyId: "prop_1", roomId: "room_102", joinedDate: "2024-08-01", leaseEnd: "2025-07-31", monthlyRent: 8000, deposit: 16000, status: "active" },
  { id: "usr_tenant_4", name: "Sneha Reddy", email: "sneha.r@rentease.com", phone: "+91 98444 55667", propertyId: "prop_2", roomId: "room_201", joinedDate: "2024-09-01", leaseEnd: "2025-08-31", monthlyRent: 9500, deposit: 19000, status: "active" }
];

// GET /api/tenants
router.get('/', (req, res) => {
  const { propertyId } = req.query;
  const filtered = propertyId ? tenants.filter(t => t.propertyId === propertyId) : tenants;
  res.json({ success: true, count: filtered.length, data: filtered });
});

// POST /api/tenants (Add & Assign Tenant)
router.post('/', (req, res) => {
  const { name, email, phone, propertyId, roomId, monthlyRent, deposit, joinedDate, leaseEnd } = req.body;
  if (!name || !roomId) {
    return res.status(400).json({ success: false, message: 'Tenant name and roomId are required' });
  }

  const newTenant = {
    id: `usr_tenant_${Date.now()}`,
    name,
    email: email || '',
    phone: phone || '',
    propertyId: propertyId || 'prop_1',
    roomId,
    monthlyRent: Number(monthlyRent) || 8000,
    deposit: Number(deposit) || 16000,
    joinedDate: joinedDate || new Date().toISOString().split('T')[0],
    leaseEnd: leaseEnd || '2025-06-30',
    status: 'active'
  };

  tenants.push(newTenant);
  res.status(201).json({ success: true, message: 'Tenant added and assigned to room', data: newTenant });
});

// DELETE /api/tenants/:id (Vacate tenant)
router.delete('/:id', (req, res) => {
  const idx = tenants.findIndex(t => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }
  const removed = tenants.splice(idx, 1)[0];
  res.json({ success: true, message: `Tenant ${removed.name} vacated successfully`, data: removed });
});

export default router;
