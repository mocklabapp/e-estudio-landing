import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const adapterRequire = createRequire(import.meta.resolve('@astrojs/vercel'));
const routingRequire = createRequire(adapterRequire.resolve('@vercel/routing-utils'));
const { pathToRegexp } = routingRequire('path-to-regexp');
const patched = routingRequire('path-to-regexp-updated');

test('routing dependency uses patched adjacent-parameter expressions with compatible keys/options', () => {
  assert.equal(routingRequire('path-to-regexp/package.json').version, '6.3.0');
  for (const path of ['/api/projects.json', '/portfolio/:id', '/:name-:suffix', '/:path*']) {
    const keys = [];
    const expectedKeys = [];
    const options = { sensitive: true, strict: true };
    const actual = pathToRegexp(path, keys, options);
    const expected = patched.pathToRegexp(path, expectedKeys, options);
    assert.equal(actual.source, expected.source);
    assert.deepEqual(keys, expectedKeys);
    assert.equal(actual.flags, expected.flags);
  }
  const route = pathToRegexp('/portfolio/:id');
  assert.ok(route.test('/portfolio/123'));
  assert.ok(!route.test('/portfolio/123/extra'));
});
