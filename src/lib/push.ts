import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getSupabase } from './supabase';

// Public client-side Firebase config (safe to ship in the bundle)
const firebaseConfig = {
  apiKey: 'AIzaSyAGfv8qyY_aOPd0eKLltQF79NN6xL4DxQw',
  authDomain: 'manziliq.firebaseapp.com',
  projectId: 'manziliq',
  messagingSenderId: '680694315850',
  appId: '1:680694315850:web:c72f77abcd43bbc5511fb3',
};

// Public VAPID key for Web Push (safe to ship)
const VAPID_KEY =
  'BElWLAUlee176aECS-dNXMAUXVz92CNm5PHDGzwbfEkXux59ju-m9PZJ-wvjz5dQglZbrpe2qBuzSJziUNSFQ9Q';

function app() {
  if (getApps().length === 0) initializeApp(firebaseConfig);
  return getApps()[0];
}

export async function pushSupported(): Promise<boolean> {
  try {
    return (await isSupported()) && 'Notification' in window && 'serviceWorker' in navigator;
  } catch {
    return false;
  }
}

export function pushPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/** Ask permission, get FCM token, register service worker, save token to DB. */
export async function enablePush(userId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await pushSupported())) return { ok: false, error: 'Push not supported in this browser' };
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return { ok: false, error: 'Notification permission denied' };

    app();
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const messaging = getMessaging(app());
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return { ok: false, error: 'Could not get push token' };

    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'Database not connected' };
    const { error } = await supabase
      .from('push_tokens')
      .upsert({ user_id: userId, token }, { onConflict: 'token' });
    if (error) return { ok: false, error: error.message };

    // Foreground messages -> show as notification too
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? 'ManzilIQ';
      const body = payload.notification?.body ?? '';
      if (document.visibilityState === 'visible') {
        new Notification(title, { body });
      }
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Push setup failed' };
  }
}
