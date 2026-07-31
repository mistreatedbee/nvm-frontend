const SDK_TOKEN = 'sdk_live_ms1g8305sh182b9n8m1baszlqth599km';
const PROJECT_KEY = 'proj_cxgmjznf';
const HANDSHAKE_URL = 'https://mookyonwpovxscsbqwwl.supabase.co/functions/v1/sdk-init';
const EVENTS_URL = 'https://mookyonwpovxscsbqwwl.supabase.co/functions/v1/events';

const HEADERS = {
  'Authorization': `Bearer ${SDK_TOKEN}`,
  'X-Project-ID': PROJECT_KEY,
  'X-SDK-Version': '1.0.0',
  'X-Platform': 'react',
  'X-Environment': 'production',
  'Content-Type': 'application/json',
};

let sessionId: string | null = null;
let deviceId: string | null = null;
let queue: object[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function generateId(): string {
  return crypto.randomUUID();
}

async function handshake(): Promise<void> {
  try {
    const res = await fetch(HANDSHAKE_URL, { method: 'POST', headers: HEADERS, body: '{}' });
    const data = await res.json();
    if (data.ok) {
      sessionId = data.sessionId;
      deviceId = data.deviceId;
    }
  } catch {
    // silent — analytics must never break the app
  }
}

export function track(eventName: string, properties: Record<string, unknown> = {}): void {
  if (!sessionId) return;
  queue.push({
    event_name: eventName,
    session_id: sessionId,
    screen_name: window.location.pathname,
    properties,
    timestamp: new Date().toISOString(),
  });
}

async function flush(): Promise<void> {
  if (!sessionId || queue.length === 0) return;
  const batch = queue.splice(0, 50);
  try {
    await fetch(EVENTS_URL, { method: 'POST', headers: HEADERS, body: JSON.stringify(batch) });
  } catch {
    // silent
  }
}

export async function initPaaq(): Promise<void> {
  await handshake();
  if (!sessionId) return;

  // Track page views on navigation
  track('page_view', { path: window.location.pathname });
  window.addEventListener('popstate', () => track('page_view', { path: window.location.pathname }));

  // Flush every 30 seconds and on page unload
  flushTimer = setInterval(flush, 30_000);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
