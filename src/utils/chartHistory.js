import { calculateMA, calculateMACD, calculateBollingerBands } from './indicators.js';

export const MA_WARMUP_BARS = 199;

export function prepareMainHistory(history, visibleCount, periods) {
  // Reserve real earlier closes for indicator calculations without displaying the warm-up gap.
  const offset = Math.min(MA_WARMUP_BARS, Math.max(0, history.length - visibleCount));
  return {
    offset,
    candles: history.slice(offset),
    maLines: periods.map(period => calculateMA(history, period).slice(offset)),
    macd: calculateMACD(history).slice(offset),
    bollinger: calculateBollingerBands(history).slice(offset),
    missingWarmup: MA_WARMUP_BARS - offset,
  };
}
