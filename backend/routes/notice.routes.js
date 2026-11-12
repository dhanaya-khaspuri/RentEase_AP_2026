import { Router } from 'express';

const router = Router();

let notices = [
  { id: "not_1", propertyId: "prop_1", propertyName: "Green Valley PG", title: "Water Supply Interruption Tomorrow Morning", category: "Maintenance", content: "Due to overhead tank cleaning, water supply paused 9 AM to 1 PM.", author: "Rahul Verma (Owner)", priority: "High", date: "2024-11-08", isPinned: true },
  { id: "not_2", propertyId: "prop_1", propertyName: "Green Valley PG", title: "High-Speed Wi-Fi Upgrade to 300 Mbps", category: "Announcement", content: "Mesh repeaters installed. Connect to 'GreenValley_5G'.", author: "Rahul Verma (Owner)", priority: "Normal", date: "2024-11-04", isPinned: false },
  { id: "not_3", propertyId: "prop_2", propertyName: "Student Homes", title: "Guest Policy & Night In-Timing Reminder", category: "Rules", content: "Main gate closes at 10:30 PM. Register visitors at desk.", author: "Student Homes Admin", priority: "High", date: "2024-11-01", isPinned: true }
];

// GET /api/notices
router.get('/', (req, res) => {
  const { propertyId } = req.query;
  const filtered = propertyId ? notices.filter(n => n.propertyId === propertyId || n.propertyId === 'all') : notices;
  res.json({ success: true, count: filtered.length, data: filtered });
});

// POST /api/notices
router.post('/', (req, res) => {
  const { propertyId, title, category, content, author, priority, isPinned } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const newNotice = {
    id: `not_${Date.now()}`,
    propertyId: propertyId || 'prop_1',
    propertyName: propertyId === 'prop_2' ? 'Student Homes' : 'Green Valley PG',
    title,
    category: category || 'Announcement',
    content,
    author: author || 'PG Owner',
    priority: priority || 'Normal',
    date: new Date().toISOString().split('T')[0],
    isPinned: Boolean(isPinned)
  };

  notices.unshift(newNotice);
  res.status(201).json({ success: true, message: 'Notice broadcasted successfully', data: newNotice });
});

// DELETE /api/notices/:id
router.delete('/:id', (req, res) => {
  const idx = notices.findIndex(n => n.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Notice not found' });
  }
  const removed = notices.splice(idx, 1)[0];
  res.json({ success: true, message: 'Notice deleted', data: removed });
});

export default router;
