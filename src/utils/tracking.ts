export function getTrackingSessionId() {
  const key = 'nvm_tracking_session_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const value = `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, value);
  return value;
}

// ---------------------------------------------------------------------------
// Journey funnel tracking
// ---------------------------------------------------------------------------

export interface JourneyEvent {
  journeyId: string;
  step: string;
  stepIndex: number;
  sessionId: string;
  timestamp: number;
  completed: boolean;
}

const JOURNEY_STORE_KEY = 'nvm_journey_events';

function readJourneyStore(): JourneyEvent[] {
  try {
    const raw = localStorage.getItem(JOURNEY_STORE_KEY);
    return raw ? (JSON.parse(raw) as JourneyEvent[]) : [];
  } catch {
    return [];
  }
}

function writeJourneyStore(events: JourneyEvent[]): void {
  try {
    localStorage.setItem(JOURNEY_STORE_KEY, JSON.stringify(events));
  } catch {
    // storage quota or SSR – silently ignore
  }
}

/**
 * Call when a user enters the first step of a defined journey.
 * @param journeyId  A stable identifier for the flow, e.g. 'onboarding' | 'core-feature' | 'conversion'
 * @param step       Human-readable label for the first step
 */
export function startJourney(journeyId: string, step: string): JourneyEvent {
  const event: JourneyEvent = {
    journeyId,
    step,
    stepIndex: 0,
    sessionId: getTrackingSessionId(),
    timestamp: Date.now(),
    completed: false,
  };
  const store = readJourneyStore();
  store.push(event);
  writeJourneyStore(store);
  return event;
}

/**
 * Call at each intermediate step of a journey.
 * @param journeyId  Must match the id used in startJourney
 * @param step       Label for the current step
 * @param stepIndex  1-based index of this step within the journey
 */
export function progressJourney(
  journeyId: string,
  step: string,
  stepIndex: number
): JourneyEvent {
  const event: JourneyEvent = {
    journeyId,
    step,
    stepIndex,
    sessionId: getTrackingSessionId(),
    timestamp: Date.now(),
    completed: false,
  };
  const store = readJourneyStore();
  store.push(event);
  writeJourneyStore(store);
  return event;
}

/**
 * Call when the user successfully completes the final step of a journey.
 * @param journeyId  Must match the id used in startJourney
 * @param step       Label for the completion step
 * @param stepIndex  Index of the final step
 */
export function completeJourney(
  journeyId: string,
  step: string,
  stepIndex: number
): JourneyEvent {
  const event: JourneyEvent = {
    journeyId,
    step,
    stepIndex,
    sessionId: getTrackingSessionId(),
    timestamp: Date.now(),
    completed: true,
  };
  const store = readJourneyStore();
  store.push(event);
  writeJourneyStore(store);
  return event;
}

/**
 * Returns a summary snapshot used by the telemetry reporter.
 * Matches the shape expected by journey.total / journey.completed metrics.
 */
export function getJourneySummary(): {
  total: number;
  completed: number;
  dropOffByStep: Record<string, number>;
} {
  const store = readJourneyStore();
  const starts = store.filter((e) => e.stepIndex === 0);
  const completions = store.filter((e) => e.completed);

  // Count how many journeys never reached a completion event
  const completedSessionJourneys = new Set(
    completions.map((e) => `${e.journeyId}::${e.sessionId}`)
  );
  const dropOffByStep: Record<string, number> = {};
  for (const event of store) {
    const key = `${event.journeyId}::${event.sessionId}`;
    if (!completedSessionJourneys.has(key)) {
      const label = `${event.journeyId}/${event.step}`;
      dropOffByStep[label] = (dropOffByStep[label] ?? 0) + 1;
    }
  }

  return {
    total: starts.length,
    completed: completions.length,
    dropOffByStep,
  };
}
