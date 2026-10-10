import { useEffect, useState } from 'react';
import { apiUrl } from '../api';
import { analyzeTradeSignal, formatTradeSignalAdvice } from '../utils/tradeSignal';

const REVIEW_INTERVAL_MS = 60 * 60 * 1000;

export default function TradeAdvice({ symbol }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!symbol || symbol.includes('=')) return undefined;
    const controller = new AbortController();
    let timer;
    const load = async () => {
      let nextReview = REVIEW_INTERVAL_MS;
      try {
        // Always use daily history, independent of the displayed chart timeframe.
        const response = await fetch(apiUrl(`/ohlcv?symbol=${encodeURIComponent(symbol)}&interval=day&limit=500`), {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]),
        });
        if (!response.ok) throw new Error('일봉 데이터 조회 실패');
        const history = await response.json();
        if (!Array.isArray(history)) throw new Error('일봉 응답 형식 오류');
        const analysis = analyzeTradeSignal(history);
        if (!controller.signal.aborted) setResult({ symbol, analysis, ...formatTradeSignalAdvice(analysis) });
      } catch (error) {
        nextReview = 60_000;
        if (!controller.signal.aborted) setResult({ symbol, tone: 'neutral', text: `신호 계산 불가 · ${error.message}` });
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(load, nextReview);
      }
    };
    void load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [symbol]);

  if (!symbol || symbol.includes('=')) return null;
  const advice = result?.symbol === symbol ? result : { tone: 'neutral', text: '일봉 기준 부분매매 신호 계산 중…' };
  const date = String(advice.analysis?.as_of || '').replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
  const title = `Stock5-8 동일 규칙 · 일봉 ${date || '조회 중'} 기준 · 1시간마다 재계산. 비율은 규칙상 참고값이며 수익 확률이나 매매 실행 지시가 아닙니다. 장중 일봉은 미완성으로 신호가 바뀔 수 있습니다.`;
  return (
    <div className={`signal-advice ${advice.tone}`} aria-label="일봉 기준 매매 참고 지침" title={title}>
      <span>{advice.text}</span>
    </div>
  );
}
