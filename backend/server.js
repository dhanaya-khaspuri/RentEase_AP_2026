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
    project: 'RentEase REST API',
    uptime: `${Math.round(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      { path: '/api/auth/login', method: 'POST', description: 'JWT User Login' },
      { path: '/api/properties', method: 'GET', description: 'List all PG properties' },
      { path: '/api/rooms', method: 'GET', description: 'Room inventory & live occupancy' },
      { path: '/api/tenants', method: 'GET', description: 'Tenants directory & lease terms' },
      { path: '/api/payments', method: 'GET', description: 'Rent ledger & payment statuses' },
      { path: '/api/complaints', method: 'GET', description: '4-stage maintenance complaints' },
      { path: '/api/notices', method: 'GET', description: 'Property notice board broadcasts' }
    ]
  });
});

// Root Home Endpoint (Browser HTML Dashboard or JSON)
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RentEase — Backend REST API</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #0f172a;
            color: #f8fafc;
            min-height: 100vh;
            padding: 40px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            max-width: 720px;
            width: 100%;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 24px;
            padding: 36px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .badge-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.85); }
          }
          h1 {
            font-size: 28px;
            font-weight: 800;
            margin-top: 16px;
            letter-spacing: -0.02em;
          }
          p.subtitle {
            color: #94a3b8;
            font-size: 14px;
            margin-top: 6px;
            line-height: 1.5;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin: 24px 0;
          }
          .card {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 14px;
            padding: 14px 16px;
          }
          .card-title {
            font-size: 11px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .card-val {
            font-size: 16px;
            font-weight: 700;
            color: #e2e8f0;
            margin-top: 4px;
            font-family: 'JetBrains Mono', monospace;
          }
          h2 {
            font-size: 14px;
            font-weight: 700;
            color: #cbd5e1;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
          }
          .endpoints {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .ep-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #0f172a;
            border: 1px solid #334155;
            padding: 12px 16px;
            border-radius: 12px;
            color: #f1f5f9;
            text-decoration: none;
            font-size: 13px;
            transition: all 0.2s;
          }
          .ep-link:hover {
            border-color: #3b82f6;
            background: #1e3a8a22;
            transform: translateX(4px);
          }
          .ep-method {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            background: #2563eb;
            color: #fff;
            padding: 3px 8px;
            border-radius: 6px;
          }
          .ep-path {
            font-family: 'JetBrains Mono', monospace;
            color: #60a5fa;
            font-weight: 600;
            margin-left: 10px;
          }
          .ep-desc {
            color: #94a3b8;
            font-size: 12px;
          }
          .btn-frontend {
            display: block;
            text-align: center;
            background: #2563eb;
            color: white;
            font-weight: 700;
            padding: 14px;
            border-radius: 14px;
            text-decoration: none;
            margin-top: 24px;
            transition: background 0.2s;
            font-size: 14px;
          }
          .btn-frontend:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">
            <span class="badge-dot"></span>
            REST API Online & Connected
          </div>
          <h1>RentEase Backend Server</h1>
          <p class="subtitle">
            Node.js / Express microservice operating on port <strong>5001</strong> with PostgreSQL Prisma schema support.
          </p>

          <div class="grid">
            <div class="card">
              <div class="card-title">Port</div>
              <div class="card-val">5001</div>
            </div>
            <div class="card">
              <div class="card-title">Health Status</div>
              <div class="card-val" style="color: #34d399;">200 OK</div>
            </div>
            <div class="card">
              <div class="card-title">Frontend App</div>
              <div class="card-val"><a href="http://localhost:3000" style="color: #60a5fa; text-decoration: none;">:3000 ↗</a></div>
            </div>
          </div>

          <h2>Available REST Endpoints</h2>
          <div class="endpoints">
            <a class="ep-link" href="/api/health" target="_blank">
              <div>
                <span class="ep-method">GET</span>
                <span class="ep-path">/api/health</span>
              </div>
              <span class="ep-desc">System diagnostic & uptime</span>
            </a>
            <a class="ep-link" href="/api/properties" target="_blank">
              <div>
                <span class="ep-method">GET</span>
                <span class="ep-path">/api/properties</span>
              </div>
              <span class="ep-desc">All PG properties (Sonipat / Delhi)</span>
            </a>
            <a class="ep-link" href="/api/rooms" target="_blank">
              <div>
                <span class="ep-method">GET</span>
                <span class="ep-path">/api/rooms</span>
              </div>
              <span class="ep-desc">Live occupancy & room inventory</span>
            </a>
            <a class="ep-link" href="/api/tenants" target="_blank">
              <div>
                <span class="ep-method">GET</span>
                <span class="ep-path">/api/tenants</span>
              </div>
              <span class="ep-desc">Active resident leases</span>
            </a>
            <a class="ep-link" href="/api/payments" target="_blank">
              <div>
                <span class="ep-method">GET</span>
                <span class="ep-path">/api/payments</span>
              </div>
              <span class="ep-desc">Rent collections & ledger</span>
            </a>
            <a class="ep-link" href="/api/complaints" target="_blank">
              <div>
                <span class="ep-method">GET</span>
                <span class="ep-path">/api/complaints</span>
              </div>
              <span class="ep-desc">4-stage maintenance tickets</span>
            </a>
            <a class="ep-link" href="/api/notices" target="_blank">
              <div>
                <span class="ep-method">GET</span>
                <span class="ep-path">/api/notices</span>
              </div>
              <span class="ep-desc">Notice board announcements</span>
            </a>
          </div>

          <a class="btn-frontend" href="http://localhost:3000" target="_blank">
            Open RentEase Frontend Portal (localhost:3000) ➔
          </a>
        </div>
      </body>
      </html>
    `);
  } else {
    res.json({
      success: true,
      name: 'RentEase REST API',
      status: 'online',
      port: PORT,
      frontendUrl: 'http://localhost:3000',
      healthCheck: `http://localhost:${PORT}/api/health`,
      documentation: `http://localhost:${PORT}/api/health`
    });
  }
});

// Fallback 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    help: 'Visit http://localhost:5001/ for the interactive endpoint catalog'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RentEase Backend running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
