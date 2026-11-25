const GMAIL_MAP_KEY = 'futs_gmail_member_map';
const GMAIL_SESSION_KEY = 'futs_gmail_session';

export const GOOGLE_LOGIN_SCOPES = 'openid email profile';
export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

export const allowLocalGmailFallback = Boolean(import.meta.env.DEV);

export class GoogleAuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'GoogleAuthError';
    this.code = code;
  }
}

export function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

export function isValidGmailAddress(email) {
  const clean = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

export function getAllEmailBindings() {
  try {
    const raw = window.localStorage.getItem(GMAIL_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeBindings(map) {
  try {
    window.localStorage.setItem(GMAIL_MAP_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export function getBoundMemberIds() {
  const map = getAllEmailBindings();
  return new Set(Object.values(map).filter(Boolean));
}

export function getMemberForIdentity({ sub = '', email = '' }) {
  const map = getAllEmailBindings();
  const cleanSub = (sub || '').trim();
  const cleanEmail = normalizeEmail(email);

  if (cleanSub && map[`sub:${cleanSub}`]) {
    const memberId = map[`sub:${cleanSub}`];
    if (cleanEmail && !map[cleanEmail]) {
      map[cleanEmail] = memberId;
      writeBindings(map);
    }
    return memberId;
  }

  if (cleanEmail && map[cleanEmail]) {
    const memberId = map[cleanEmail];
    if (cleanSub && !map[`sub:${cleanSub}`]) {
      map[`sub:${cleanSub}`] = memberId;
      writeBindings(map);
    }
    return memberId;
  }

  return null;
}

export function getMemberForEmail(email) {
  return getMemberForIdentity({ email });
}

export function bindIdentityToMember({ sub = '', email = '' }, memberId) {
  const cleanEmail = normalizeEmail(email);
  const cleanSub = (sub || '').trim();
  if ((!cleanEmail && !cleanSub) || !memberId) {
    return { ok: false, reason: 'invalid' };
  }

  const map = getAllEmailBindings();
  const existingKeysForMember = Object.entries(map)
    .filter(([, id]) => id === memberId)
    .map(([key]) => key);

  const ownKeys = new Set([
    ...(cleanEmail ? [cleanEmail] : []),
    ...(cleanSub ? [`sub:${cleanSub}`] : []),
  ]);

  const claimedByOther = existingKeysForMember.some((key) => !ownKeys.has(key));
  if (claimedByOther) {
    return { ok: false, reason: 'already_claimed' };
  }

  if (cleanEmail) map[cleanEmail] = memberId;
  if (cleanSub) map[`sub:${cleanSub}`] = memberId;
  writeBindings(map);
  return { ok: true };
}

export function bindEmailToMember(email, memberId) {
  return bindIdentityToMember({ email }, memberId);
}

export function loadGmailSession() {
  try {
    const raw = window.localStorage.getItem(GMAIL_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.email || !session.memberId) return null;
    // Never hydrate bearer tokens from localStorage; keep identity metadata only.
    return {
      email: normalizeEmail(session.email),
      sub: session.sub || '',
      memberId: session.memberId,
      name: session.name || '',
      picture: session.picture || '',
    };
  } catch {
    return null;
  }
}

export function saveGmailSession(session) {
  if (!session?.email || !session?.memberId) return;
  try {
    // Strip accessToken / expiresAt before persisting to localStorage.
    const safeSession = {
      email: normalizeEmail(session.email),
      sub: session.sub || '',
      memberId: session.memberId,
      name: session.name || '',
      picture: session.picture || '',
    };
    window.localStorage.setItem(GMAIL_SESSION_KEY, JSON.stringify(safeSession));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearGmailSession() {
  try {
    window.localStorage.removeItem(GMAIL_SESSION_KEY);
  } catch {
    // Ignore
  }
}

let gisScriptPromise = null;

export function loadGisScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new GoogleAuthError('unavailable', 'Browser window unavailable.'));
  }
  if (navigator.onLine === false) {
    return Promise.reject(new GoogleAuthError('offline', 'You appear to be offline. Check your connection and try again.'));
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);
  if (gisScriptPromise) return gisScriptPromise;

  gisScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gis-client="true"]');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.gisClient = 'true';
    const timeoutId = window.setTimeout(() => {
      gisScriptPromise = null;
      script.remove();
      reject(new GoogleAuthError('timeout', 'Google Sign-In took too long to load. Check your connection or popup blocker and try again.'));
    }, 12000);
    script.onload = () => {
      window.clearTimeout(timeoutId);
      if (window.google?.accounts?.oauth2) {
        resolve(window.google);
      } else {
        gisScriptPromise = null;
        script.remove();
        reject(new GoogleAuthError('api_error', 'Google Sign-In client could not be initialized.'));
      }
    };
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      gisScriptPromise = null;
      script.remove();
      reject(new GoogleAuthError('offline', 'Could not reach Google Sign-In. Check your network and try again.'));
    };
    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

export async function requestGoogleOAuthToken({
  clientId,
  scope = GOOGLE_LOGIN_SCOPES,
  prompt = '',
  includeGrantedScopes = true,
}) {
  if (!clientId) {
    throw new GoogleAuthError('config', 'Google OAuth Client ID is not configured.');
  }
  if (navigator.onLine === false) {
    throw new GoogleAuthError('offline', 'You are offline. Reconnect to sign in with Google.');
  }

  const google = await loadGisScript();

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new GoogleAuthError('timeout', 'Google sign-in timed out. Please try again.'));
    }, 120000);

    const finishReject = (err) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      reject(err);
    };

    const finishResolve = (val) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(val);
    };

    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope,
        include_granted_scopes: includeGrantedScopes,
        callback: (response) => {
          if (response?.error) {
            if (response.error === 'access_denied') {
              finishReject(new GoogleAuthError('access_denied', 'Access was denied on Google consent screen.'));
            } else {
              finishReject(new GoogleAuthError('api_error', response.error_description || response.error));
            }
            return;
          }
          if (!response?.access_token) {
            finishReject(new GoogleAuthError('api_error', 'No access token returned by Google.'));
            return;
          }
          const grantedAllScopes =
            typeof google.accounts.oauth2.hasGrantedAllScopes === 'function'
              ? google.accounts.oauth2.hasGrantedAllScopes(response, scope)
              : true;
          const expiresInSec = Number(response.expires_in) || 3600;
          finishResolve({
            accessToken: response.access_token,
            expiresAt: Date.now() + expiresInSec * 1000,
            grantedAllScopes,
          });
        },
        error_callback: (err) => {
          const type = err?.type;
          if (type === 'popup_closed') {
            finishReject(new GoogleAuthError('cancelled', 'Google sign-in was cancelled.'));
            return;
          }
          if (type === 'popup_failed_to_open') {
            finishReject(
              new GoogleAuthError(
                'popup_blocked',
                'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.',
              ),
            );
            return;
          }
          finishReject(new GoogleAuthError('api_error', err?.message || 'Google sign-in could not be completed.'));
        },
      });
      tokenClient.requestAccessToken({ prompt });
    } catch (err) {
      finishReject(new GoogleAuthError('api_error', err?.message || 'Could not start Google sign-in.'));
    }
  });
}

export function revokeGoogleToken(accessToken) {
  if (!accessToken) return;
  try {
    window.google?.accounts?.oauth2?.revoke?.(accessToken, () => {});
  } catch {
    // Ignore revoke errors on cleanup
  }
}

export async function fetchGoogleUserProfile(accessToken) {
  if (navigator.onLine === false) {
    throw new GoogleAuthError('offline', 'Lost network connection while reading your Google profile.');
  }
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401 || res.status === 403) {
    throw new GoogleAuthError('auth_revoked', 'Google sign-in session is invalid or expired.');
  }
  if (!res.ok) {
    throw new GoogleAuthError('api_error', 'Could not read your Google profile.');
  }
  const data = await res.json();
  if (data.email_verified !== true) {
    throw new GoogleAuthError(
      'unverified_email',
      'Your Google email address is not verified. Verify it in Google Account settings first.',
    );
  }
  return {
    sub: data.sub || '',
    email: normalizeEmail(data.email),
    emailVerified: true,
    name: data.name || '',
    picture: data.picture || '',
  };
}

function toLocalDateKey(isoOrDate) {
  if (!isoOrDate) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) return isoOrDate;
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function classifyGoogleApiError(res, fallbackMsg) {
  if (res.status === 401 || res.status === 403) {
    return new GoogleAuthError('auth_revoked', 'Google Calendar access expired or was revoked. Please reconnect.');
  }
  if (res.status === 429) {
    return new GoogleAuthError('rate_limited', 'Google Calendar rate limit reached. Wait a moment and try again.');
  }
  return new GoogleAuthError('api_error', fallbackMsg);
}

export async function fetchGoogleCalendarEvents(accessToken, timeMinIso, timeMaxIso) {
  if (navigator.onLine === false) {
    throw new GoogleAuthError('offline', 'You are offline. Cannot sync Google Calendar.');
  }
  const params = new URLSearchParams({
    timeMin: timeMinIso,
    timeMax: timeMaxIso,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '80',
  });
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw classifyGoogleApiError(res, 'Google Calendar sync failed.');
  const data = await res.json();
  return (data.items || [])
    .map((item) => {
      const dateKey = toLocalDateKey(item.start?.date || item.start?.dateTime);
      if (!dateKey) return null;
      const startTime = item.start?.dateTime
        ? new Date(item.start.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : 'All day';
      return {
        id: item.id,
        title: item.summary || 'Busy event',
        dateKey,
        startTime,
        htmlLink: item.htmlLink || '',
      };
    })
    .filter(Boolean);
}

export async function createGoogleCalendarEvent(accessToken, { title, dateKey, location = '', description = '' }) {
  if (navigator.onLine === false) {
    throw new GoogleAuthError('offline', 'You are offline. Cannot add event to Google Calendar.');
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
  const body = {
    summary: title,
    location,
    description,
    start: { dateTime: `${dateKey}T16:00:00`, timeZone: tz },
    end: { dateTime: `${dateKey}T19:00:00`, timeZone: tz },
  };
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw classifyGoogleApiError(res, 'Could not add event to Google Calendar.');
  return res.json();
}

export function buildGoogleCalendarEventUrl({ title, dateKey, location = '', details = '' }) {
  const ymd = (dateKey || '').replace(/-/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Fish Upon The Sky Outing',
  });
  if (ymd.length === 8) {
    params.set('dates', `${ymd}T160000/${ymd}T190000`);
  }
  if (location) params.set('location', location);
  if (details) params.set('details', details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadGroupIcsFile({ polls = [], busyDaysList = [], memberName = 'Group' }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fish Upon The Sky//Group Planner//EN',
    'CALSCALE:GREGORIAN',
  ];

  const pad = (dateKey) => dateKey.replace(/-/g, '');

  polls.forEach((poll) => {
    (poll.options || []).forEach((opt) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(opt.id)) return;
      const ymd = pad(opt.id);
      lines.push(
        'BEGIN:VEVENT',
        `UID:futs-poll-${poll.id}-${ymd}@fishuponthesky`,
        `DTSTART:${ymd}T160000`,
        `DTEND:${ymd}T190000`,
        `SUMMARY:${poll.title} (Vote option)`,
        `DESCRIPTION:${poll.detail || 'Fish Upon The Sky group outing option'}`,
        'END:VEVENT',
      );
    });
  });

  busyDaysList.forEach((dateKey) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
    const ymd = pad(dateKey);
    lines.push(
      'BEGIN:VEVENT',
      `UID:futs-busy-${ymd}@fishuponthesky`,
      `DTSTART;VALUE=DATE:${ymd}`,
      `SUMMARY:${memberName} — Unavailable (Fish Upon The Sky)`,
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fish-upon-the-sky-calendar.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
