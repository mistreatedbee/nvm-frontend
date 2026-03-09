export const KNOWLEDGE_CATEGORIES = [
  'GETTING_STARTED',
  'PRODUCTS',
  'ORDERS',
  'PAYMENTS',
  'MARKETING',
  'POLICIES',
  'BEST_PRACTICES',
  'OTHER',
] as const;

export const RESOURCE_TYPES = ['PDF', 'VIDEO', 'LINK', 'FILE'] as const;

export function formatKnowledgeCategory(category?: string) {
  if (!category) return 'Other';
  return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getKnowledgeSessionId() {
  const key = 'knowledge_session_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const sessionId = `k-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, sessionId);
  return sessionId;
}
