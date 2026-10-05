const historyCache = new Map();

export function parseNaverHistory(text) {
  // Older rows have an empty foreign-ownership field, so the response is not valid JSON.
  return [...text.matchAll(/\["(\d{8})"\s*,([^\]]+)\]/g)]
    .map(([, date, fields]) => {
      const [open, high, low, close, volume] = fields.split(',').slice(0, 5).map(Number);
      return { date, open, high, low, close, volume };
    })
    .filter(row => [row.open, row.high, row.low, row.close, row.volume].every(Number.isFinite)
      && row.open > 0 && row.close > 0);
}

export function mergeDailyHistory(older, recent) {
  const byDate = new Map(older.map(row => [row.date, row]));
  recent.forEach(row => byDate.set(row.date, row));
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function extendKoreanDailyHistory(code, limit, recent) {
  if (limit <= 2500 || recent.length >= limit) return recent;
  const now = new Date();
  const start = new Date(Math.max(Date.UTC(1990, 0, 1), now.getTime() - limit * 1.7 * 86400000));
  const startTime = start.toISOString().slice(0, 10).replaceAll('-', '');
  const endTime = now.toISOString().slice(0, 10).replaceAll('-', '');
  const cacheKey = `${code}:${startTime}:${endTime}`;
  let entry = historyCache.get(cacheKey);
  if (!entry || Date.now() - entry.ts >= 3600000) {
    const response = await fetch(`https://api.finance.naver.com/siseJson.naver?symbol=${encodeURIComponent(code)}&requestType=1&startTime=${startTime}&endTime=${endTime}&timeframe=day`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Naver history responded ${response.status}`);
    const rows = parseNaverHistory(await response.text());
    if (!rows.length) throw new Error('Naver history is empty');
    entry = { ts: Date.now(), rows };
    if (historyCache.size >= 100) historyCache.delete(historyCache.keys().next().value);
    historyCache.set(cacheKey, entry);
  }
  // Always overlay fresh candles, including the current open session, on cached older history.
  return mergeDailyHistory(entry.rows, recent);
}
