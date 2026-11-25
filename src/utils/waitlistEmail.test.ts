import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWaitlistEmailPayload,
  createRateLimiter,
  escapeHtml,
  stripHeaderNewlines,
} from './waitlistEmail';

test('stripHeaderNewlines neutralizes CRLF header injection characters', () => {
  const cleaned = stripHeaderNewlines('Maya\r\nBcc: attacker@evil.test\n');
  assert.equal(cleaned.includes('\r'), false);
  assert.equal(cleaned.includes('\n'), false);
  assert.equal(cleaned, 'Maya Bcc: attacker@evil.test');
});

test('escapeHtml neutralizes script tags and attribute quotes', () => {
  const escaped = escapeHtml('<script>alert("x")</script> & \'test\'');
  assert.equal(
    escaped,
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;test&#39;',
  );
});

test('buildWaitlistEmailPayload constructs safe subject, replyTo, text, and escaped html', () => {
  const payload = buildWaitlistEmailPayload({
    referenceCode: 'HBR-123456',
    fullName: 'Maya <b>Lin</b>\r\n',
    email: 'maya@example.org',
    focusArea: 'Sleep & Burnout Recovery',
    region: 'Phoenix, AZ',
    submittedAt: '2026-11-25T20:00:00.000Z',
  });

  assert.equal(payload.replyTo, 'maya@example.org');
  assert.equal(payload.subject.includes('\n'), false);
  assert.ok(payload.text.includes('HBR-123456'));
  assert.ok(payload.text.includes('Phoenix, AZ'));
  assert.ok(payload.html.includes('&lt;b&gt;Lin&lt;/b&gt;'));
  assert.equal(payload.html.includes('<b>Lin</b>'), false);
});

test('createRateLimiter enforces maxRequests per sliding window', () => {
  const allow = createRateLimiter(2, 1000);
  assert.equal(allow('1.2.3.4', 100), true);
  assert.equal(allow('1.2.3.4', 200), true);
  assert.equal(allow('1.2.3.4', 300), false);
  assert.equal(allow('5.6.7.8', 300), true);
  assert.equal(allow('1.2.3.4', 1200), true);
});
