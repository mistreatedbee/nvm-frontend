import { PAAQ } from '@paaq/sdk';

// Same PAAQ project credentials the hand-rolled client previously used
// directly against the Supabase edge functions. The SDK now owns session
// id, device id, batching, retries, the periodic heartbeat, and (in the
// browser build) automatic performance monitoring — none of that needs to
// be reimplemented here anymore.
const SDK_TOKEN = 'sdk_live_ms1g8305sh182b9n8m1baszlqth599km';
const PROJECT_KEY = 'proj_cxgmjznf';

export const OutcomeType = {
  PURCHASE_COMPLETE: 'PURCHASE_COMPLETE',
  REGISTRATION_COMPLETE: 'REGISTRATION_COMPLETE',
  VENDOR_ONBOARDED: 'VENDOR_ONBOARDED',
} as const;

export type OutcomeType = typeof OutcomeType[keyof typeof OutcomeType];

let ready = false;

export function track(eventName: string, properties: Record<string, unknown> = {}): void {
  if (!ready) return;
  PAAQ.track(eventName, properties);
}

export async function trackOutcome(outcomeType: OutcomeType, properties: Record<string, unknown> = {}): Promise<void> {
  if (!ready) return;
  // endSession() is the SDK's purpose-built outcome API — it reports the
  // outcome plus session duration in one call and flushes immediately,
  // same as the old track('outcome', ...) + flush() pairing.
  track('outcome', { outcome_type: outcomeType, ...properties });
  await PAAQ.endSession(outcomeType);
}

export async function initPaaq(): Promise<void> {
  try {
    const result = await PAAQ.initialize({ sdkToken: SDK_TOKEN, projectId: PROJECT_KEY });
    ready = Boolean(result?.ok);
  } catch {
    // analytics must never break the app
    return;
  }
  if (!ready) return;

  PAAQ.page(window.location.pathname);
  window.addEventListener('popstate', () => PAAQ.page(window.location.pathname));

  // Best-effort flush before the tab goes away — the SDK still owns its
  // own periodic flush/heartbeat timers regardless.
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void PAAQ.flush();
  });
  window.addEventListener('beforeunload', () => {
    void PAAQ.flush();
  });
}
