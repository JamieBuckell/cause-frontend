const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/pages/Families/List.vue'), 'utf8');
const method = source.slice(source.indexOf('    async doMarkDirect('), source.indexOf('    async doBulkMarkDirect('));
function setup(api) {
  const calls = [], dialogs = [], commits = [];
  const methods = vm.runInNewContext('({' + method + '})', {
    markDirectHamper: async body => { calls.push(body); return api(); },
    Swal: { fire: async options => { dialogs.push(options); } },
  });
  const state = { markingDirect: false, userInGroup: () => true, options: { directHamper: true },
    $store: { getters: { getActiveCampaign: 'CHC2026' }, commit: (...args) => commits.push(args) } };
  const family = { reference: 'TEST-001', receiveStatus: '' };
  return { state, family, calls, dialogs, commits, run: () => methods.doMarkDirect.call(state, family) };
}
test('organisation direct receipt waits for persistence before updating the displayed family', async () => {
  let resolve;
  const f = setup(() => new Promise(r => { resolve = r; }));
  const pending = f.run();
  assert.equal(f.family.receiveStatus, '');
  assert.equal(f.state.markingDirect, true);
  await f.run();
  assert.equal(f.calls.length, 1);
  resolve({ status: 200, data: { success: true } });
  await pending;
  assert.equal(f.calls[0].hamperId, 'TEST-001');
  assert.equal(f.calls[0].campaignId, 'CHC2026');
  assert.equal(f.family.receiveStatus, 'direct-hamper');
  assert.equal(f.state.markingDirect, false);
  assert.deepEqual(f.commits[0], ['setForceRefresh', true]);
});
for (const api of [() => { throw Error('Network error'); }, () => ({ status: 400, data: { messages: { error: 'Not saved' } } })]) {
  test('failed direct receipt preserves displayed status and releases the pending action', async () => {
    const f = setup(api); await f.run();
    assert.equal(f.family.receiveStatus, '');
    assert.equal(f.state.markingDirect, false);
    assert.equal(f.commits.length, 0);
    assert.equal(f.dialogs[0].icon, 'error');
  });
}
test('direct receipt cannot run for non-admins or where the option is disabled', async () => {
  const f = setup(() => { throw Error('Must not call API'); });
  f.state.userInGroup = () => false; await f.run();
  f.state.userInGroup = () => true; f.state.options.directHamper = false; await f.run();
  assert.equal(f.calls.length, 0);
});
