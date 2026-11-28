const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY || '').trim();

export const hasVapidPublicKey = Boolean(VAPID_PUBLIC_KEY);

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function isPushSupported() {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isIosBrowserNotInstalled() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIos = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches || navigator.standalone === true;
  return isIos && !isStandalone;
}

export async function getPushStatus() {
  if (isIosBrowserNotInstalled()) {
    return { supported: false, reason: 'ios-install', subscribed: false, permission: 'default' };
  }
  if (!isPushSupported()) {
    return { supported: false, reason: 'unsupported', subscribed: false, permission: 'default' };
  }
  const permission = Notification.permission;
  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) {
      return { supported: true, subscribed: false, permission };
    }
    const sub = await registration.pushManager.getSubscription();
    return { supported: true, subscribed: Boolean(sub), permission };
  } catch {
    return { supported: true, subscribed: false, permission };
  }
}

export async function subscribeDevicePush(client, memberId) {
  if (isIosBrowserNotInstalled()) {
    return { ok: false, reason: 'ios-install', message: 'On iPhone/iPad, tap Share → Add to Home Screen first to enable notifications.' };
  }
  if (!isPushSupported()) {
    return { ok: false, reason: 'unsupported', message: 'Push notifications are not supported on this browser.' };
  }
  if (!hasVapidPublicKey) {
    return { ok: false, reason: 'missing-vapid', message: 'Missing VITE_VAPID_PUBLIC_KEY in environment (see docs/PUSH-SETUP.md).' };
  }
  if (!client || !memberId) {
    return { ok: false, reason: 'local-only', message: 'Sign in with your Supabase account to sync push notifications.' };
  }

  try {
    const permission = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

    if (permission !== 'granted') {
      return { ok: false, reason: 'denied', message: 'Notification permission was blocked in browser settings.' };
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const json = subscription.toJSON();
    const endpoint = json.endpoint;
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!endpoint || !p256dh || !auth) {
      return { ok: false, reason: 'invalid-sub', message: 'Could not read device push keys.' };
    }

    const { error } = await client.from('push_subscriptions').upsert(
      {
        endpoint,
        member_id: memberId,
        p256dh,
        auth,
        user_agent: (navigator.userAgent || '').slice(0, 180),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    );

    if (error) {
      return { ok: false, reason: 'db-error', message: error.message || 'Could not save push subscription.' };
    }

    return { ok: true, subscribed: true };
  } catch (err) {
    return {
      ok: false,
      reason: 'error',
      message: err?.message || 'Could not subscribe this device for notifications.',
    };
  }
}

export async function unsubscribeDevicePush(client) {
  if (!isPushSupported()) return { ok: true, subscribed: false };
  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const sub = await registration?.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      if (client && endpoint) {
        await client.from('push_subscriptions').delete().eq('endpoint', endpoint);
      }
    }
  } catch {
    // Ignore unsubscribe errors
  }
  return { ok: true, subscribed: false };
}

export function sendGroupPush(client, payload) {
  if (!client || !payload?.title) return;
  client.functions
    .invoke('send-push', {
      body: {
        title: payload.title,
        body: payload.body || '',
        url: payload.url || '/',
        tag: payload.tag || 'fish-update',
        targetMemberIds: Array.isArray(payload.targetMemberIds) ? payload.targetMemberIds : undefined,
      },
    })
    .catch(() => {});
}
