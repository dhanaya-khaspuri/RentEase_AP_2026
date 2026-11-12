import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rentease-super-secret-key-2026';

// Mock users database for instant standalone testing
const users = [
  { id: 'usr_owner_1', name: 'Rahul Verma', email: 'owner@rentease.com', role: 'OWNER', phone: '+91 98765 43210', status: 'active' },
  { id: 'usr_tenant_1', name: 'Aarav Sharma', email: 'tenant@rentease.com', role: 'TENANT', phone: '+91 98111 22334', propertyId: 'prop_1', roomId: 'room_101', status: 'active' },
  { id: 'usr_admin_1', name: 'Siddharth Mehta', email: 'admin@rentease.com', role: 'ADMIN', phone: '+91 99999 88888', status: 'active' }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email) || users[0];

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    role: role?.toUpperCase() || 'TENANT',
    phone: phone || '',
    status: 'active'
  };
  users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: newUser
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
