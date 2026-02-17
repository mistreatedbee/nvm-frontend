export const PUBLICATION_TYPES = ['ANNOUNCEMENT', 'BLOG'] as const;
export const PUBLICATION_AUDIENCES = ['ALL', 'VENDOR', 'CUSTOMER'] as const;
export const PUBLICATION_STATUS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export function formatPublicationType(type?: string) {
  if (!type) return 'Post';
  return type === 'ANNOUNCEMENT' ? 'Announcement' : 'Blog';
}

export function formatPublicationAudience(audience?: string) {
  if (!audience) return 'All';
  if (audience === 'VENDOR') return 'Vendors';
  if (audience === 'CUSTOMER') return 'Customers';
  return 'All';
}

export function getPublicationSessionId() {
  const key = 'publication_session_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const sessionId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, sessionId);
  return sessionId;
}
