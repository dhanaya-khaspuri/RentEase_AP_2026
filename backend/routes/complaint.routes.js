import { Router } from 'express';

const router = Router();

let complaints = [
  { id: "cmp_1", tenantId: "usr_tenant_1", tenantName: "Aarav Sharma", propertyId: "prop_1", propertyName: "Green Valley PG", roomNumber: "101", category: "Plumbing", title: "Bathroom tap leaking continuously", description: "The sink mixer tap in room 101 has been dripping since yesterday evening.", priority: "Medium", status: "In Progress", assignedTo: "Ramesh (Plumber)", createdAt: "2024-11-07 09:30", updatedAt: "2024-11-08 14:00" },
  { id: "cmp_2", tenantId: "usr_tenant_3", tenantName: "Priyansh Verma", propertyId: "prop_1", propertyName: "Green Valley PG", roomNumber: "102", category: "Wi-Fi", title: "Wi-Fi disconnecting repeatedly on 1st Floor", description: "Router keeps restarting every 15 minutes.", priority: "High", status: "Assigned", assignedTo: "Airtel Fiber Tech (Vikas)", createdAt: "2024-11-08 16:20", updatedAt: "2024-11-08 17:00" },
  { id: "cmp_3", tenantId: "usr_tenant_2", tenantName: "Rohan Gupta", propertyId: "prop_1", propertyName: "Green Valley PG", roomNumber: "101", category: "Electrical", title: "Geyser not heating properly", description: "Water barely gets lukewarm after 30 minutes of switching on.", priority: "Low", status: "Pending", assignedTo: null, createdAt: "2024-11-09 08:15", updatedAt: "2024-11-09 08:15" },
  { id: "cmp_4", tenantId: "usr_tenant_4", tenantName: "Sneha Reddy", propertyId: "prop_2", propertyName: "Student Homes", roomNumber: "201", category: "Housekeeping", title: "Room deep cleaning requested", description: "Scheduled bi-weekly cleaning missed.", priority: "Medium", status: "Resolved", assignedTo: "Anita (Housekeeping)", createdAt: "2024-11-02 10:00", updatedAt: "2024-11-03 12:00" }
];

// GET /api/complaints
router.get('/', (req, res) => {
  const { propertyId, status } = req.query;
  let filtered = complaints;
  if (propertyId) filtered = filtered.filter(c => c.propertyId === propertyId);
  if (status) filtered = filtered.filter(c => c.status === status);

  res.json({
    success: true,
    count: filtered.length,
    activeTickets: filtered.filter(c => c.status !== 'Resolved').length,
    data: filtered
  });
});

// POST /api/complaints (Raise Complaint)
router.post('/', (req, res) => {
  const { tenantId, tenantName, propertyId, roomNumber, category, title, description, priority } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required' });
  }

  const now = new Date();
  const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

  const newComplaint = {
    id: `cmp_${Date.now()}`,
    tenantId: tenantId || 'usr_tenant_1',
    tenantName: tenantName || 'Verified Tenant',
    propertyId: propertyId || 'prop_1',
    propertyName: propertyId === 'prop_2' ? 'Student Homes' : 'Green Valley PG',
    roomNumber: roomNumber || '101',
    category: category || 'General',
    title,
    description,
    priority: priority || 'Medium',
    status: 'Pending',
    assignedTo: null,
    createdAt: dateStr,
    updatedAt: dateStr
  };

  complaints.unshift(newComplaint);
  res.status(201).json({ success: true, message: 'Complaint registered successfully', data: newComplaint });
});

// PATCH /api/complaints/:id/status (Lifecycle Update: Pending -> Assigned -> In Progress -> Resolved)
router.patch('/:id/status', (req, res) => {
  const { status, assignedTo, resolutionNotes } = req.body;
  const complaint = complaints.find(c => c.id === req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const now = new Date();
  const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

  if (status) complaint.status = status;
  if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
  if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
  complaint.updatedAt = dateStr;

  res.json({
    success: true,
    message: `Complaint updated to ${complaint.status}`,
    data: complaint
  });
});

export default router;
