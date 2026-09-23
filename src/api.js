function detectApiBase() {
  if (typeof window === 'undefined') return '/stock5-7/api';

  const match = window.location.pathname.match(/^\/(stock5-\d+)(?:\/|$)/);
  return match ? `/${match[1]}/api` : '/stock5-7/api';
}

export const API_BASE = detectApiBase();

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
