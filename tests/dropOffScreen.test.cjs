const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/pages/Dashboard/Dashboard/DropOff.vue'), 'utf8');
function fixture(overrides = {}) {
  const timers = [];
  const calls = [];
  const component = vm.runInNewContext(source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*;$/gm, '').replace('export default', 'component ='), {
    defineComponent: value => value,
    getScannerCampaign: overrides.campaign || (async () => ({ status: 200, data: { success: true, campaignId: 'CURRENT', campaignName: 'Current campaign' } })),
    getHamperScreen: async id => { calls.push(id); return overrides.stats ? overrides.stats(id) : { status: 200, data: { hampersDropped: 12, bagsDropped: 30, hampersDirect: 3, allocatedConfirmed: 20 } }; },
    setTimeout: (fn, delay) => { timers.push({ fn, delay }); return timers.length; },
    clearTimeout: () => {},
  });
  const state = { ...component.data(), ...component.methods, $route: { params: {} }, $store: { getters: { getActiveCampaign: 'OLD' } } };
  return { state, component, timers, calls };
}
test('uses backend current campaign, numeric counts and valid percentage units', async () => {
  const { state, component, timers, calls } = fixture();
  await state.refreshStats();
  assert.deepEqual(calls, ['CURRENT']);
  assert.equal(state.campaignName, 'Current campaign');
  assert.equal(state.pending, 5);
  assert.equal(state.hasStats, true);
  assert.match(component.computed.cssVars.call(state)['--in-percentage'], /^71%$/);
  assert.equal(timers[0].delay, 120000);
});
test('explicit campaign override bypasses current campaign lookup', async () => {
  const { state, calls } = fixture({ campaign: () => { throw Error('Should not resolve'); } });
  state.$route.params.campaignId = 'OVERRIDE';
  await state.refreshStats();
  assert.deepEqual(calls, ['OVERRIDE']);
});
test('offline refresh preserves figures and timestamp and continues retrying', async () => {
  const { state, timers } = fixture({ stats: async () => { throw Error('Network Error'); } });
  Object.assign(state, { droppped: 42, hasStats: true, lastUpdated: 123 });
  await state.refreshStats();
  assert.equal(state.droppped, 42);
  assert.equal(state.lastUpdated, 123);
  assert.equal(state.refreshing, false);
  assert.equal(timers.length, 1);
  await timers[0].fn();
  assert.equal(timers.length, 2);
});
test('error responses and malformed counts do not overwrite successful figures', async () => {
  for (const response of [
    { status: 504, data: { messages: 'Timeout' } },
    { status: 200, data: { hampersDropped: 0 } },
    { status: 200, data: { hampersDropped: '12', bagsDropped: 30, hampersDirect: 3, allocatedConfirmed: 20 } },
  ]) {
    const { state, timers } = fixture({ stats: async () => response });
    state.droppped = 42;
    await state.refreshStats();
    assert.equal(state.droppped, 42);
    assert.equal(timers.length, 1);
  }
});
test('failed campaign resolution retries without requesting an old campaign', async () => {
  const { state, calls, timers } = fixture({ campaign: async () => ({ status: 400, data: { success: false } }) });
  await state.refreshStats();
  assert.deepEqual(calls, []);
  assert.equal(state.hasStats, false);
  assert.equal(timers.length, 1);
});
test('navigation ignores late data and immediately schedules the new campaign', async () => {
  let resolve;
  const { state, timers } = fixture({ stats: () => new Promise(r => { resolve = r; }) });
  state.$route.params.campaignId = 'OLD';
  const pending = state.refreshStats();
  state.$route.params.campaignId = 'NEW';
  resolve({ status: 200, data: { hampersDropped: 12, bagsDropped: 30, hampersDirect: 3, allocatedConfirmed: 20 } });
  await pending;
  assert.equal(state.hasStats, false);
  assert.equal(timers[0].delay, 0);
});
test('unmount ignores in-flight results and stops polling; empty totals give valid CSS', async () => {
  let resolve;
  const { state, component, timers } = fixture({ stats: () => new Promise(r => { resolve = r; }) });
  state.$route.params.campaignId = 'CURRENT';
  assert.equal(component.computed.cssVars.call(state)['--in-percentage'], '0%');
  const pending = state.refreshStats();
  component.beforeDestroy.call(state);
  resolve({ status: 200, data: { hampersDropped: 12, bagsDropped: 30, hampersDirect: 3, allocatedConfirmed: 20 } });
  await pending;
  assert.equal(state.hasStats, false);
  assert.equal(timers.length, 0);
});
