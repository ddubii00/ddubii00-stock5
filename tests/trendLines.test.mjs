import assert from 'node:assert/strict';
import { test } from 'node:test';
import { candleTimestamp, cleanTrendLines, distanceToTrendLine, logicalAtTime, timeAtLogical } from '../src/utils/trendLines.js';

test('pointer-transparent trend lines hit-test segments, endpoints and invalid geometry', () => {
  const line = { a: { x: 10, y: 20 }, b: { x: 110, y: 20 } };
  assert.equal(distanceToTrendLine({ x: 50, y: 25 }, line), 5);
  assert.equal(distanceToTrendLine({ x: 120, y: 20 }, line), 10);
  assert.equal(distanceToTrendLine({ x: 50, y: 40 }, line), 20);
  assert.equal(distanceToTrendLine({ x: 50, y: 50 }, { a: { x: 10, y: 10 }, b: { x: 90, y: 90 } }), 0);
  assert.equal(distanceToTrendLine({ x: 13, y: 24 }, { a: line.a, b: line.a }), 5);
  assert.equal(distanceToTrendLine({ x: 50, y: 25 }, { a: { x: null, y: 20 }, b: line.b }), Infinity);
});

test('anchors stay on the same trading date as history grows or rolls forward', () => {
  const bars = ['2026-09-28', '2026-09-29', '2026-09-30'].map(time => ({ time }));
  const time = timeAtLogical(bars, 1);
  assert.equal(time, candleTimestamp('2026-09-29'));
  assert.equal(logicalAtTime(bars, time), 1);
  assert.equal(logicalAtTime([{ time: '2026-09-25' }, ...bars], time), 2);
  assert.equal(logicalAtTime(bars.slice(1), time), 0);
  assert.equal(logicalAtTime(bars.slice(2), time), null);
});

test('holiday weeks snap to the actual candle date and preserve intraday seconds', () => {
  const weeks = [{ time: '2026-09-21' }, { time: '2026-09-29' }, { time: '2026-10-05' }];
  assert.equal(timeAtLogical(weeks, 1.4), candleTimestamp('2026-09-29'));
  const minutes = [{ time: 1790730000 }, { time: 1790730060 }];
  assert.equal(timeAtLogical(minutes, 1), 1790730060);
  assert.equal(logicalAtTime(minutes, 1790730060), 1);
});

test('shared state keeps symbol/timeframe drawings separate and strips invalid data', () => {
  const line = { id: 'line1', start: { time: 1790640000, price: 100 }, end: { time: 1790726400, price: 110 }, width: 2, pixels: { x: 20 } };
  const clean = cleanTrendLines({
    '005930.KS:day': [line, { ...line, start: { time: 'bad', price: 2 } }],
    '005930.KS:week': [{ ...line, id: 'week', width: 3 }],
    '005930.KS:1m': [{ ...line, id: 'minute', width: 99 }],
    '000660.KS:day': [],
    invalid: [line],
  });
  assert.equal(clean['005930.KS:day'].length, 1);
  assert.equal(clean['005930.KS:day'][0].pixels, undefined);
  assert.equal(clean['005930.KS:week'][0].width, 3);
  assert.equal(clean['005930.KS:1m'][0].width, 1);
  assert.equal(clean.invalid, undefined);
});
