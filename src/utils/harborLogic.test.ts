import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractVerifiedSources,
  getNextPracticeStep,
  parseStructuredGuidance,
  SUPPORT_FOCUS_OPTIONS,
  validateSearchQuery,
  validateWaitlistForm,
} from './harborLogic';

test('validateWaitlistForm rejects empty required fields', () => {
  const result = validateWaitlistForm({
    fullName: ' ',
    email: '',
    focusArea: 'Invalid Option',
    region: '',
    acceptedConsent: false,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.email);
  assert.ok(result.errors.focusArea);
  assert.ok(result.errors.acceptedConsent);
});

test('validateWaitlistForm rejects malformed email and accepts valid input', () => {
  const badEmail = validateWaitlistForm({
    fullName: 'Maya Lin',
    email: 'maya@invalid',
    focusArea: SUPPORT_FOCUS_OPTIONS[0],
    region: 'Seattle, WA',
    acceptedConsent: true,
  });
  assert.equal(badEmail.valid, false);
  assert.ok(badEmail.errors.email);

  const valid = validateWaitlistForm({
    fullName: 'Maya Lin',
    email: 'maya.lin@example.org',
    focusArea: SUPPORT_FOCUS_OPTIONS[1],
    region: 'Seattle, WA',
    acceptedConsent: true,
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validateSearchQuery enforces length bounds and collapses whitespace', () => {
  const short = validateSearchQuery('  hi ');
  assert.equal(short.valid, false);
  assert.ok(short.error);

  const long = validateSearchQuery('a'.repeat(245));
  assert.equal(long.valid, false);
  assert.equal(long.sanitized.length, 240);

  const ok = validateSearchQuery('  free   crisis   lines in Oregon  ');
  assert.equal(ok.valid, true);
  assert.equal(ok.sanitized, 'free crisis lines in Oregon');
});

test('extractVerifiedSources filters unsafe URLs and deduplicates sources', () => {
  const sources = extractVerifiedSources([
    { web: { uri: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders', title: 'NIMH Anxiety Disorders' } },
    { web: { uri: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders', title: 'Duplicate' } },
    { web: { uri: 'javascript:alert(1)', title: 'Unsafe' } },
    { web: { uri: 'https://988lifeline.org/', title: '' } },
  ]);

  assert.equal(sources.length, 2);
  assert.equal(sources[0].domain, 'nimh.nih.gov');
  assert.equal(sources[0].title, 'NIMH Anxiety Disorders');
  assert.equal(sources[1].domain, '988lifeline.org');
  assert.equal(sources[1].title, '988lifeline.org');
});

test('parseStructuredGuidance formats headings, bullets, and strips markdown emphasis', () => {
  const blocks = parseStructuredGuidance(
    '## Immediate Support\n- **988 Lifeline**: Call or text 988.\n1. Speak with a trained counselor.\nAvailable 24/7 across the US.',
  );

  assert.deepEqual(blocks, [
    { type: 'heading', text: 'Immediate Support' },
    { type: 'bullet', text: '988 Lifeline: Call or text 988.' },
    { type: 'bullet', text: 'Speak with a trained counselor.' },
    { type: 'paragraph', text: 'Available 24/7 across the US.' },
  ]);
});

test('getNextPracticeStep wraps cleanly around step count', () => {
  assert.equal(getNextPracticeStep(0, 3), 1);
  assert.equal(getNextPracticeStep(2, 3), 0);
  assert.equal(getNextPracticeStep(0, 0), 0);
});
