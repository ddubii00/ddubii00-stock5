export function detectApiBase(location = typeof window === 'undefined' ? null : window.location) {
  if (!location || /(^|\.)vercel\.app$/i.test(location.hostname || '')) return '/api';
  const match = (location.pathname || '').match(/^\/(stock5-\d+)(?:\/|$)/);
  return match ? `/${match[1]}/api` : '/api';
}

export const API_BASE = detectApiBase();

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
