import { Router } from 'express';

const router = Router();

let properties = [
  {
    id: "prop_1",
    ownerId: "usr_owner_1",
    name: "Green Valley PG",
    location: "Sonipat, Haryana (Near Rajiv Gandhi Education City)",
    totalRooms: 25,
    type: "Boys & Working Professionals",
    amenities: ["High-speed Wi-Fi", "3 Meals Included", "Power Backup", "CCTV Security", "Washing Machine"],
    managerPhone: "+91 98765 43211",
    createdAt: new Date().toISOString()
  },
  {
    id: "prop_2",
    ownerId: "usr_owner_1",
    name: "Student Homes",
    location: "North Campus, Delhi University, Delhi",
    totalRooms: 40,
    type: "Co-living & Students",
    amenities: ["Wi-Fi", "Housekeeping", "Biometric Access", "AC Rooms", "Study Lounge"],
    managerPhone: "+91 98765 43212",
    createdAt: new Date().toISOString()
  }
];

// GET /api/properties
router.get('/', (req, res) => {
  res.json({ success: true, count: properties.length, data: properties });
});

// GET /api/properties/:id
router.get('/:id', (req, res) => {
  const property = properties.find(p => p.id === req.params.id);
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }
  res.json({ success: true, data: property });
});

// POST /api/properties
router.post('/', (req, res) => {
  const { name, location, totalRooms, type, amenities, managerPhone } = req.body;
  if (!name || !location) {
    return res.status(400).json({ success: false, message: 'Name and location are required' });
  }

  const newProperty = {
    id: `prop_${Date.now()}`,
    ownerId: req.body.ownerId || "usr_owner_1",
    name,
    location,
    totalRooms: Number(totalRooms) || 10,
    type: type || "Co-living & Students",
    amenities: Array.isArray(amenities) ? amenities : (amenities || '').split(',').map(s => s.trim()),
    managerPhone: managerPhone || '+91 98000 00000',
    createdAt: new Date().toISOString()
  };

  properties.push(newProperty);
  res.status(201).json({ success: true, message: 'Property created successfully', data: newProperty });
});

export default router;
