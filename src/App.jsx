import { useCallback, useEffect, useState } from 'react';
import ChartColumn from './components/ChartColumn';
import { apiUrl } from './api';
import './index.css';

// 7. 4개 차트 세트 (2×2 그리드)
// 1. 마지막 선택 종목 기억 → localStorage 키를 각 컬럼마다 부여
const COLUMNS = [
  { id: 'col-1', defaultSymbol: '000660.KS', defaultName: 'SK하이닉스' },
  { id: 'col-2', defaultSymbol: '005930.KS', defaultName: '삼성전자' },
  { id: 'col-3', defaultSymbol: '^GSPC',     defaultName: 'S&P 500' },
  { id: 'col-4', defaultSymbol: '^KS11',     defaultName: 'KOSPI 종합' },
];

const MARKET_ITEMS = [
  { key: 'usdKrw', symbol: 'KRW=X', label: '달러/원' },
  { key: 'kospi', symbol: '^KS11', label: 'KOSPI' },
  { key: 'kosdaq', symbol: '^KQ11', label: 'KOSDAQ' },
  { key: 'nasdaq', symbol: '^IXIC', label: '나스닥' },
  { key: 'sp500', symbol: '^GSPC', label: 'S&P500' },
];

function formatFixed(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatSignedFixed(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  const sign = n > 0 ? '+' : '';
  return `${sign}${formatFixed(n, digits)}`;
}

function formatSignedPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

function timeParts(timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find(part => part.type === 'weekday')?.value;
  const hour = Number(parts.find(part => part.type === 'hour')?.value);
  const minute = Number(parts.find(part => part.type === 'minute')?.value);
  return { weekday, minutes: hour * 60 + minute };
}

function isWeekday(weekday) {
  return weekday !== 'Sat' && weekday !== 'Sun';
}

function isKrxUpdateWindow(krxMarket) {
  const { weekday, minutes } = timeParts('Asia/Seoul');
  if (!isWeekday(weekday)) return false;
  const regularSession = minutes >= 9 * 60 && minutes <= 15 * 60 + 32;
  const afterMarketSession = krxMarket === 'extended' && minutes >= 16 * 60 && minutes <= 20 * 60;
  return regularSession || afterMarketSession;
}

function isUsOpen() {
  const { weekday, minutes } = timeParts('America/New_York');
  return isWeekday(weekday) && minutes >= 9 * 60 + 30 && minutes <= 16 * 60;
}

function MarketQuote({ item, quote }) {
  const hasPrice = Number.isFinite(quote?.price);
  const hasChange = Number.isFinite(quote?.changePct) && Number.isFinite(quote?.change);
  const direction = hasChange && quote.change !== 0 ? (quote.change > 0 ? 'up' : 'down') : '';
  return (
    <span className={`market-item ${direction}`} data-market={item.key}
      title={hasPrice ? undefined : '시세를 불러오는 중입니다. 조회 실패 시 자동으로 재시도합니다.'}>
      {item.label}<strong className="market-price">{hasPrice ? formatFixed(quote.price, 0) : '—'}</strong>
      <span className="market-change market-change-fixed">
        {hasChange ? `(${formatSignedPercent(quote.changePct)}, ${formatSignedFixed(quote.change, 1)})` : '(—%, —)'}
      </span>
    </span>
  );
}

function App() {
  const [marketSummary, setMarketSummary] = useState({ kospi: null, kosdaq: null, nasdaq: null, sp500: null, usdKrw: null });
  const [showBollinger, setShowBollinger] = useState(false);
  const [showLineBreak, setShowLineBreak] = useState(false);
  const [globalWeekly, setGlobalWeekly] = useState(false);
  const [krxMarket, setKrxMarket] = useState('regular');

  const fetchQuote = useCallback(async (symbol, signal) => {
    const response = await fetch(
      apiUrl(`/quote?symbol=${encodeURIComponent(symbol)}&market=${krxMarket}`),
      { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) }
    );
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) return null;

    const data = await response.json();
    return data?.price != null && Number.isFinite(Number(data.price))
      ? { ...data, price: Number(data.price) } : null;
  }, [krxMarket]);

  useEffect(() => {
    const controller = new AbortController();
    const loaded = new Set();
    let timer = null;
    const update = async () => {
      const krxOpen = isKrxUpdateWindow(krxMarket);
      const usOpen = isUsOpen();
      const items = MARKET_ITEMS.filter(item => {
        if (!loaded.has(item.key)) return true;
        if (item.key === 'kospi' || item.key === 'kosdaq') return krxOpen;
        if (item.key === 'usdKrw') return krxOpen || usOpen;
        return usOpen;
      });
      await Promise.all(items.map(async item => {
        const quote = await fetchQuote(item.symbol, controller.signal).catch(() => null);
        if (!quote || controller.signal.aborted) return;
        loaded.add(item.key);
        // Publish each quote as it arrives, even when another provider is slow.
        setMarketSummary(current => ({ ...current, [item.key]: quote }));
      }));
      if (!controller.signal.aborted) {
        timer = setTimeout(update, krxOpen ? 1000 : usOpen ? 3000 : 30000);
      }
    };
    update();

    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [krxMarket, fetchQuote]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="market-summary" aria-label="시장 요약">
          {MARKET_ITEMS.map(item => <MarketQuote key={item.key} item={item} quote={marketSummary[item.key]} />)}
        </div>
        <div className="header-controls" aria-label="차트 및 한국 시장 시세 설정">
          <button
            type="button"
            className={`header-bb-button${showLineBreak ? ' active' : ''}`}
            onClick={() => setShowLineBreak(enabled => !enabled)}
            title="전체 메인 차트 삼선전환도 표시/해제 (일목균형표 유지)"
            aria-pressed={showLineBreak}
          >
            삼선
          </button>
          <button
            type="button"
            className={`header-bb-button${globalWeekly ? ' active' : ''}`}
            onClick={() => setGlobalWeekly(enabled => !enabled)}
            title="전체 캔들·거래량·MACD·일목균형표를 주봉으로 전환. 끄면 이전 주기로 복원"
            aria-label="전체 차트 주봉 전환"
            aria-pressed={globalWeekly}
          >
            주
          </button>
          <button
            type="button"
            className={`header-bb-button${showBollinger ? ' active' : ''}`}
            onClick={() => setShowBollinger(visible => !visible)}
            title="전체 캔들차트 볼린저밴드 표시"
            aria-pressed={showBollinger}
          >
            BB
          </button>
          <button
            type="button"
            className={`header-market-button${krxMarket === 'regular' ? ' active' : ''}`}
            onClick={() => setKrxMarket('regular')}
            title="KRX 정규장 가격만 표시합니다. 동시호가 종가는 15:32에 한 번 더 확인합니다."
            aria-pressed={krxMarket === 'regular'}
          >
            KRX
          </button>
          <button
            type="button"
            className={`header-market-button${krxMarket === 'extended' ? ' active' : ''}`}
            onClick={() => setKrxMarket('extended')}
            title="KRX 정규장과 16:00~20:00 애프터마켓 가격을 표시합니다."
            aria-pressed={krxMarket === 'extended'}
          >
            KRX2
          </button>
        </div>
      </header>
      <div className="dashboard-grid">
        {COLUMNS.map(col => (
          <ChartColumn
            key={col.id}
            id={col.id}
            defaultSymbol={col.defaultSymbol}
            defaultName={col.defaultName}
            showBollinger={showBollinger}
            showLineBreak={showLineBreak}
            globalWeekly={globalWeekly}
            krxMarket={krxMarket}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
