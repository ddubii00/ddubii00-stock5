import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MA_WARMUP_BARS, prepareMainHistory } from '../src/utils/chartHistory.js';
import { mergeDailyHistory, parseNaverHistory } from '../api/_history.js';

function history(length) {
  return Array.from({ length }, (_, i) => ({ time: i + 1, close: i + 1, open: i + 1, high: i + 2, low: i, volume: i + 1 }));
}

test('all displayed candles have full MA200 with separately retained warm-up history', () => {
  for (const count of [120, 200, 2000]) {
    const result = prepareMainHistory(history(count + MA_WARMUP_BARS), count, [5, 60, 120, 200]);
    assert.equal(result.candles.length, count);
    assert.equal(result.missingWarmup, 0);
    result.maLines.forEach(line => {
      assert.ok(line.every(bar => Number.isFinite(bar.value)));
      assert.deepEqual(line.map(bar => bar.time), result.candles.map(bar => bar.time));
    });
    assert.equal(result.maLines[3][0].value, 100.5);
    assert.deepEqual(result.macd.map(bar => bar.time), result.candles.map(bar => bar.time));
    assert.deepEqual(result.bollinger.map(bar => bar.time), result.candles.map(bar => bar.time));
  }
});

test('pannable history keeps MA200 complete, including after a new live candle', () => {
  const bars = history(840);
  const first = prepareMainHistory(bars, 120, [200]);
  assert.equal(first.candles.length, 641);
  assert.ok(first.maLines[0].every(bar => bar.value !== null));
  const updated = prepareMainHistory(history(841), 120, [200]);
  assert.equal(updated.maLines[0].at(-1).value, 741.5);
  assert.deepEqual(updated.maLines[0][0], first.maLines[0][0]);
});

test('short listing history keeps requested candles and does not fabricate averages', () => {
  const result = prepareMainHistory(history(250), 120, [200]);
  assert.equal(result.candles.length, 120);
  assert.equal(result.missingWarmup, 69);
  assert.equal(result.maLines[0][0].value, null);
});

test('Naver old rows with empty foreign-ownership values parse safely', () => {
  const rows = parseNaverHistory(`[['날짜', '시가'], ["20140710", 26160, 26220, 26040, 26120, 179204, ], ["20140711", 26000, 26040, 25640, 25680, 215592, 50.8667]]`);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].close, 26120);
  assert.equal(rows[1].volume, 215592);
  assert.deepEqual(mergeDailyHistory(rows, [{ ...rows[1], close: 27000 }]).map(row => row.close), [26120, 27000]);
});
