import { calculateMA, calculateMACD, calculateBollingerBands } from './indicators.js';
import { calculateThreeLineBreak } from './threeLineBreak.js';

export const MA_WARMUP_BARS = 199;

export function prepareMainHistory(history, visibleCount, periods, { lineBreak = false } = {}) {
  const bars = lineBreak ? calculateThreeLineBreak(history) : history;
  // Reserve real earlier closes for indicator calculations without displaying the warm-up gap.
  const offset = Math.min(MA_WARMUP_BARS, Math.max(0, bars.length - visibleCount));
  return {
    sourceBars: bars,
    offset,
    candles: bars.slice(offset),
    maLines: periods.map(period => calculateMA(bars, period).slice(offset)),
    macd: lineBreak ? [] : calculateMACD(bars).slice(offset),
    bollinger: calculateBollingerBands(bars).slice(offset),
    missingWarmup: MA_WARMUP_BARS - offset,
  };
}
