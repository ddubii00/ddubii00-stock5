import test from 'node:test';
import assert from 'node:assert/strict';
import { detectApiBase } from '../src/api.js';

test('Vercel uses serverless API even under the build asset base path', () => {
  assert.equal(detectApiBase({ hostname: 'ddubii00-stock5.vercel.app', pathname: '/' }), '/api');
  assert.equal(detectApiBase({ hostname: 'preview.vercel.app', pathname: '/stock5-7/' }), '/api');
});

test('Oracle and local prefixed deployments keep their API namespace', () => {
  for (const name of ['stock5-7', 'stock5-91']) {
    assert.equal(detectApiBase({ hostname: '158.179.192.139', pathname: `/${name}/` }), `/${name}/api`);
    assert.equal(detectApiBase({ hostname: '127.0.0.1', pathname: `/${name}/` }), `/${name}/api`);
  }
  assert.equal(detectApiBase({ hostname: '127.0.0.1', pathname: '/' }), '/api');
  assert.equal(detectApiBase(null), '/api');
});
