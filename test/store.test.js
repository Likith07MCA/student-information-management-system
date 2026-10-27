'use strict';
// ASSERTION: tests for the student store using the assert module
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { StudentStore } = require('../lib/studentStore');

const file = path.join(os.tmpdir(), `sms-test-${process.pid}.json`);
const store = new StudentStore(file);
const sample = { rollNo: 'T001', name: 'Test User', email: 't@x.com', department: 'CSE', year: 2 };

(async () => {
  const events = [];
  ['added', 'updated', 'deleted'].forEach((e) => store.on(e, () => events.push(e)));

  assert.deepStrictEqual(await store.list(), [], 'starts empty');

  const s = await store.add(sample);
  assert.strictEqual(s.name, 'Test User');
  assert.ok(s.id, 'id generated');

  await assert.rejects(store.add(sample), { code: 'E_DUPLICATE' });                                // duplicate
  await assert.rejects(store.add({ ...sample, rollNo: 'T2', email: 'bad' }), { code: 'E_VALIDATION' });

  assert.strictEqual((await store.list({ search: 'test' })).length, 1, 'search finds student');
  assert.strictEqual((await store.list({ search: 'zzz' })).length, 0, 'search misses');

  const u = await store.update(s.id, { name: 'Renamed' });
  assert.strictEqual(u.name, 'Renamed');
  await assert.rejects(store.update('nope', { name: 'Xavier' }), { statusCode: 404 });

  await store.remove(s.id);
  await assert.rejects(store.get(s.id), { code: 'E_NOT_FOUND' });

  // concurrent writes must not lose data
  await Promise.all([1, 2, 3, 4, 5].map((n) => store.add({ ...sample, rollNo: 'C' + n })));
  assert.strictEqual((await store.list()).length, 5, 'concurrent adds all saved');

  assert.deepStrictEqual(events.slice(0, 3), ['added', 'updated', 'deleted']);
  fs.unlinkSync(file);
  console.log('All tests passed');
})().catch((e) => { console.error('TEST FAILED:', e.message); process.exit(1); });
