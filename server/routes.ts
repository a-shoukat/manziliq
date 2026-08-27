import express, { Request, Response, Router } from 'express';
import {
  dispatchNotification,
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserPreferences,
  updateUserPreferences,
  getAllDeliveryLogs,
  retryNotificationDispatch,
  runAutomatedScheduledJobs
} from './notificationOrchestrator';
import { registerDeviceToken, getUserDeviceTokens, invalidateToken } from './fcmService';

export const notificationRouter: Router = express.Router();

// 1. Dispatch Notification (Multi-channel: in_app, push, sms, email)
notificationRouter.post('/dispatch', async (req: Request, res: Response) => {
  try {
    const result = await dispatchNotification(req.body);
    res.json({
      success: true,
      notification: result.notification,
      duplicateSkipped: result.duplicateSkipped || false
    });
  } catch (error: any) {
    console.error('Error dispatching notification:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to dispatch notification' });
  }
});

// 2. Get Notifications (Filtered by userId / role)
notificationRouter.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const role = req.query.role as string | undefined;
    const notifications = getAllNotifications(userId, role);
    res.json({ success: true, count: notifications.length, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Mark Single Notification as Read
notificationRouter.patch('/:id/read', (req: Request, res: Response) => {
  try {
    const success = markNotificationAsRead(req.params.id);
    res.json({ success, id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Mark All as Read
notificationRouter.post('/mark-all-read', (req: Request, res: Response) => {
  try {
    const userId = req.body.userId as string | undefined;
    const count = markAllNotificationsAsRead(userId);
    res.json({ success: true, markedCount: count });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. User Notification Preferences
notificationRouter.get('/preferences/:userId', (req: Request, res: Response) => {
  try {
    const preferences = getUserPreferences(req.params.userId);
    res.json({ success: true, preferences });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

notificationRouter.put('/preferences/:userId', (req: Request, res: Response) => {
  try {
    const preferences = updateUserPreferences(req.params.userId, req.body);
    res.json({ success: true, preferences });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. FCM Device Token Registration
notificationRouter.post('/fcm/register-token', (req: Request, res: Response) => {
  try {
    const { userId, token, platform, deviceModel } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ success: false, error: 'userId and token are required' });
    }
    const registered = registerDeviceToken(userId, token, platform || 'web', deviceModel || 'Web Browser');
    res.json({ success: true, token: registered });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

notificationRouter.get('/fcm/tokens/:userId', (req: Request, res: Response) => {
  try {
    const tokens = getUserDeviceTokens(req.params.userId);
    res.json({ success: true, count: tokens.length, tokens });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Delivery Logs & Telemetry
notificationRouter.get('/logs', (_req: Request, res: Response) => {
  try {
    const logs = getAllDeliveryLogs();
    res.json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Retry Failed Notification
notificationRouter.post('/:id/retry', async (req: Request, res: Response) => {
  try {
    const result = await retryNotificationDispatch(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Run Scheduled Reminders / Automated Job Trigger
notificationRouter.post('/scheduler/run', async (req: Request, res: Response) => {
  try {
    const result = await runAutomatedScheduledJobs(req.body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Service Status & Config Inspection
notificationRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    channels: {
      in_app: { available: true, status: 'operational' },
      push_fcm: {
        available: true,
        configured: Boolean(process.env.FCM_SERVER_KEY),
        mode: process.env.FCM_SERVER_KEY ? 'Live Firebase FCM' : 'Development Simulator'
      },
      sms: {
        available: true,
        configured: Boolean(process.env.SMS_GATEWAY_API_KEY),
        mode: process.env.SMS_GATEWAY_API_KEY ? 'Live Telco Gateway' : 'Development Telco Simulator'
      },
      email: {
        available: true,
        configured: Boolean(process.env.SMTP_HOST),
        mode: process.env.SMTP_HOST ? 'Live SMTP Mailer' : 'Development Mail Simulator'
      }
    }
  });
});
