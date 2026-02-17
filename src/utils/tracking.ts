export function getTrackingSessionId() {
  const key = 'nvm_tracking_session_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const value = `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, value);
  return value;
}
