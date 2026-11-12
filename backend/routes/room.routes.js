import { Router } from 'express';

const router = Router();

let rooms = [
  { id: "room_101", propertyId: "prop_1", roomNumber: "101", floor: 1, capacity: 2, occupied: 2, rent: 8000, type: "Double Sharing", hasAC: true, hasAttachedBath: true },
  { id: "room_102", propertyId: "prop_1", roomNumber: "102", floor: 1, capacity: 2, occupied: 1, rent: 8000, type: "Double Sharing", hasAC: true, hasAttachedBath: true },
  { id: "room_103", propertyId: "prop_1", roomNumber: "103", floor: 1, capacity: 3, occupied: 0, rent: 7000, type: "Triple Sharing", hasAC: false, hasAttachedBath: true },
  { id: "room_104", propertyId: "prop_1", roomNumber: "104", floor: 1, capacity: 1, occupied: 1, rent: 12000, type: "Single Deluxe", hasAC: true, hasAttachedBath: true },
  { id: "room_201", propertyId: "prop_2", roomNumber: "201", floor: 2, capacity: 2, occupied: 1, rent: 9500, type: "Premium Twin", hasAC: true, hasAttachedBath: true }
];

// GET /api/rooms
router.get('/', (req, res) => {
  const { propertyId } = req.query;
  const filtered = propertyId ? rooms.filter(r => r.propertyId === propertyId) : rooms;

  const totalBeds = filtered.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = filtered.reduce((acc, r) => acc + r.occupied, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  res.json({
    success: true,
    count: filtered.length,
    occupancySummary: {
      totalRooms: filtered.length,
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      occupancyRate: `${occupancyRate}%`
    },
    data: filtered
  });
});

// POST /api/rooms
router.post('/', (req, res) => {
  const { propertyId, roomNumber, floor, capacity, rent, type, hasAC, hasAttachedBath } = req.body;
  if (!propertyId || !roomNumber) {
    return res.status(400).json({ success: false, message: 'propertyId and roomNumber are required' });
  }

  const newRoom = {
    id: `room_${Date.now()}`,
    propertyId,
    roomNumber,
    floor: Number(floor) || 1,
    capacity: Number(capacity) || 2,
    occupied: 0,
    rent: Number(rent) || 8000,
    type: type || "Double Sharing",
    hasAC: Boolean(hasAC),
    hasAttachedBath: Boolean(hasAttachedBath)
  };

  rooms.push(newRoom);
  res.status(201).json({ success: true, message: 'Room added successfully', data: newRoom });
});

export default router;
