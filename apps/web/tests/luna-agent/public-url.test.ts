import assert from 'node:assert/strict';
import test from 'node:test';

import { assertPublicHttpUrl, isPrivateIpAddress } from '../../app/lib/security/public-url';

test('detects private and reserved IP addresses', () => {
  for (const address of [
    '0.0.0.0',
    '10.0.0.1',
    '127.0.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.168.1.1',
    '::',
    '::1',
    'fc00::1',
    'fe80::1',
    '::ffff:127.0.0.1'
  ]) {
    assert.equal(isPrivateIpAddress(address), true, address);
  }

  assert.equal(isPrivateIpAddress('93.184.216.34'), false);
  assert.equal(isPrivateIpAddress('2606:2800:220:1:248:1893:25c8:1946'), false);
});

test('rejects local URLs, credentials and non-HTTP protocols', async () => {
  await assert.rejects(() => assertPublicHttpUrl('http://localhost/admin'));
  await assert.rejects(() => assertPublicHttpUrl('http://127.0.0.1/admin'));
  await assert.rejects(() => assertPublicHttpUrl('http://[::1]/admin'));
  await assert.rejects(() => assertPublicHttpUrl('https://user:pass@93.184.216.34'));
  await assert.rejects(() => assertPublicHttpUrl('file:///etc/passwd'));
});

test('accepts a literal public HTTPS address', async () => {
  const url = await assertPublicHttpUrl('https://93.184.216.34/path#fragment');
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, '93.184.216.34');
});
