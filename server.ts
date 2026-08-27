import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { notificationRouter } from './server/routes';
import { aiRouter } from './server/ai';
import { propertyVoiceRouter } from './server/propertyVoice';
import { runSeed } from './scripts/seed';
import { 
  SEED_USERS, 
  SEED_SOCIETIES, 
  SEED_PLOTS, 
  SEED_PROPERTIES, 
  SEED_BOOKINGS, 
  SEED_INSTALLMENTS,
  SEED_LOT_ASSIGNMENTS,
  SEED_DOCUMENTS,
  SEED_NOTIFICATIONS,
  SEED_INQUIRIES,
  SEED_DISPUTES
} from './scripts/seedData';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MANZILIQ Real Estate Core & Notification Dispatcher',
      timestamp: new Date().toISOString()
    });
  });

  // Seed / Reset Demo Data Endpoint
  app.post('/api/seed', async (req, res) => {
    try {
      await runSeed();
      res.json({
        success: true,
        message: 'MANZILIQ demo seed data generated and initialized successfully.',
        stats: {
          societiesCount: SEED_SOCIETIES.length,
          plotsCount: SEED_PLOTS.length,
          usersCount: SEED_USERS.length,
          bookingsCount: SEED_BOOKINGS.length,
          installmentsCount: SEED_INSTALLMENTS.length,
          lotAssignmentsCount: SEED_LOT_ASSIGNMENTS.length,
          documentsCount: SEED_DOCUMENTS.length,
          notificationsCount: SEED_NOTIFICATIONS.length,
          inquiriesCount: SEED_INQUIRIES.length,
          disputesCount: SEED_DISPUTES.length
        },
        district: 'Narowal, Punjab, Pakistan'
      });
    } catch (error: any) {
      console.error('API Seed Error:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to execute seed' });
    }
  });

  app.get('/api/seed/summary', (req, res) => {
    res.json({
      district: 'Narowal, Punjab, Pakistan',
      societies: SEED_SOCIETIES.map(s => ({ id: s.id, name: s.name, totalPlots: s.totalPlots, available: s.availablePlots, reserved: s.reservedPlots, sold: s.soldPlots })),
      roles: {
        superAdmin: SEED_USERS.filter(u => u.role === 'super_admin').map(u => ({ id: u.id, name: u.name, email: u.email })),
        societyAdmin: SEED_USERS.filter(u => u.role === 'society_admin').map(u => ({ id: u.id, name: u.name, email: u.email, society: u.societyName })),
        dealers: SEED_USERS.filter(u => u.role === 'dealer').map(u => ({ id: u.id, name: u.name, email: u.email, license: u.licenseNo })),
        customers: SEED_USERS.filter(u => u.role === 'buyer').map(u => ({ id: u.id, name: u.name, email: u.email }))
      },
      totalPlots: SEED_PLOTS.length,
      activeBookings: SEED_BOOKINGS.length,
      ledgerEntries: SEED_INSTALLMENTS.length
    });
  });

  // Serve voice notes and uploads statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Mount Centralized Notification Orchestrator API Routes
  app.use('/api/notifications', notificationRouter);

  // Mount Gemini-powered Real Estate AI Assistant API
  app.use('/api/ai', aiRouter);

  // Mount Voice Property Listing & Management API Routes
  app.use('/api/properties', propertyVoiceRouter);

  // Guard: Catch-all 404 for unmatched /api routes so they return JSON rather than Vite SPA index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Vite middleware for development vs static bundle for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MANZILIQ Server] Application running at http://0.0.0.0:${PORT}`);
    console.log(`[MANZILIQ Server] Multi-channel Notification Engine active (SMS, Email, FCM Push, In-App)`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
