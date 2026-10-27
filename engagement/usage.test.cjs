const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const { join } = require('node:path');

test('operation helper emits fixed metadata and exactly one terminal outcome', async () => {
  const source = stripTypeScriptTypes(readFileSync(join(__dirname, 'usage.ts'), 'utf8'));
  const { usageOperation, usageEvent } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const before = global.document;
  const document = new EventTarget();
  global.document = document;
  const events = [];
  document.addEventListener('afeiii:usage', event => events.push(event.detail));
  try {
    const operation = usageOperation('merge-pdf');
    operation.success(); operation.failure(); operation.success(); operation.download();
    assert.deepEqual(events.map(e => e.phase), ['start', 'success', 'download']);
    assert.ok(events.every(e => e.id === events[0].id));
    assert.deepEqual(Object.keys(events[0]).sort(), ['id', 'phase', 'tool']);
    usageEvent('download', 'export');
    assert.notEqual(events.at(-1).id, events[0].id);
    const failed = usageOperation('convert'); failed.failure(); failed.success();
    assert.deepEqual(events.slice(-2).map(e => e.phase), ['start', 'failure']);
  } finally { global.document = before; }
});
