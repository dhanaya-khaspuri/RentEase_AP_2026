import express from 'express';
import cors from 'cors';

// Route handlers
import authRoutes from './routes/auth.routes.js';
import propertyRoutes from './routes/property.routes.js';
import roomRoutes from './routes/room.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import noticeRoutes from './routes/notice.routes.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API Mount Points
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);

// System Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    project: 'RentEase API — Week 2 Deliverable',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/properties',
      '/api/rooms',
      '/api/tenants',
      '/api/payments',
      '/api/complaints',
      '/api/notices'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RentEase Backend running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
