const STORAGE_KEY = 'dhvtt_last_seen_fear_event';

export interface FearEvent {
  id: string;
  timestamp: number;
}

export function getLastSeenFearEventId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function markFearEventSeen(eventId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, eventId);
  } catch {
    /* ignore */
  }
}

export function shouldShowFearAlert(
  event: FearEvent | null | undefined,
  isMaster: boolean
): boolean {
  if (isMaster || !event?.id) return false;
  return getLastSeenFearEventId() !== event.id;
}

export function parseFearEvent(fearData: unknown): FearEvent | null {
  if (!fearData || typeof fearData !== 'object') return null;
  const data = fearData as Record<string, unknown>;

  if (typeof data.last_event_id === 'string' && data.last_event_id) {
    return {
      id: data.last_event_id,
      timestamp: typeof data.last_event_at === 'number' ? data.last_event_at : Date.now(),
    };
  }

  // Legacy: migrate mental model from last_trigger timestamp-only events
  if (typeof data.last_trigger === 'number' && data.last_trigger > 0) {
    return {
      id: `legacy-${data.last_trigger}`,
      timestamp: data.last_trigger,
    };
  }

  return null;
}

export function createFearEventId(): string {
  return crypto.randomUUID();
}
