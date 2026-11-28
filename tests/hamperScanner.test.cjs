const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/pages/Families/AcceptHamper.vue'), 'utf8');
function fixture(api = {}) {
  const calls = [];
  const methodsSource = source.slice(source.indexOf('    clearDetails()'), source.indexOf('    timeout(ms)'));
  const methods = vm.runInNewContext('({' + methodsSource + '})', {
    checkHamper: async body => { calls.push(['check', body]); return api.check(body); },
    recieveHamper: async body => { calls.push(['receive', body]); return api.receive(body); },
    getScannerCampaign: async () => api.campaign(),
    Swal: { fire: async () => {} },
  });
  const state = { ...methods, campaignId: 'CURRENT', hamperId: 'hc04hl012', numberOfBags: 2, loading: false, submitting: false, decoding: false, messages: [], camera: 'auto', cameraInitAttempt: 0, cameraKey: 0, pageVisible: true, timeout: async () => {} };
  return { state, calls };
}
test('campaign load uses backend current campaign independently of browser selection', async () => {
  const { state } = fixture({ campaign: async () => ({ data: { success: true, campaignId: 'NEW', campaignName: 'New campaign' } }) });
  await state.loadCampaign();
  assert.equal(state.campaignId, 'NEW');
  assert.equal(state.campaignLoading, false);
});
test('failed campaign load disables scanner and provides retry feedback', async () => {
  const { state } = fixture({ campaign: async () => { throw Error('offline'); } });
  await state.loadCampaign();
  assert.equal(state.campaignId, '');
  assert.equal(state.campaignLoading, false);
  assert.match(state.messages[0].error, /connection/);
});
test('overlapping QR decodes cannot overwrite an in-flight lookup', async () => {
  let resolve;
  const { state, calls } = fixture({ check: () => new Promise(r => { resolve = r; }) });
  const pending = state.onDecode('HC04HL-012');
  assert.equal(state.camera, 'off');
  await state.onDecode('OTHER-001');
  assert.equal(calls.length, 1);
  assert.equal(state.hamperId, 'HC04HL-012');
  assert.equal(calls[0][1].expectedCampaignId, 'CURRENT');
  resolve({ data: { success: true, hamperId: 'HC04HL-012' } });
  await pending;
  assert.equal(state.decoding, false);
  assert.equal(state.camera, 'auto');
});
test('failed lookup clears loading, confirmation and previous family details', async () => {
  const { state } = fixture({ check: async () => { throw Error('offline'); } });
  state.donorName = 'Previous donor';
  await state.onDecode('HC04HL-012');
  assert.equal(state.loading, false);
  assert.equal(state.showScanConfirmation, false);
  assert.equal(state.donorName, '');
  assert.match(state.messages[0].error, /connection/);
});
test('receipt blocks double submission, pins campaign, and preserves input on failure', async () => {
  let resolve;
  const { state, calls } = fixture({ receive: () => new Promise(r => { resolve = r; }) });
  const pending = state.recieveHamper();
  await state.recieveHamper();
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].expectedCampaignId, 'CURRENT');
  resolve({ data: { success: false, messages: { error: 'Not saved' } } });
  await pending;
  assert.equal(state.submitting, false);
  assert.equal(state.camera, 'auto');
  assert.equal(state.hamperId, 'hc04hl012');
  assert.equal(state.messages[0].error, 'Not saved');
});
test('camera failure reveals actionable feedback and retry remounts camera', async () => {
  const { state } = fixture();
  state.cameraKey = 0;
  await state.onInit(Promise.reject(Error('NotAllowedError')));
  assert.match(state.cameraError, /permissions/);
  state.retryCamera();
  assert.equal(state.cameraError, '');
  assert.equal(state.cameraKey, 1);
});

for (const bagsReceived of [0, '0', undefined, null, 3]) {
  test(`lookup displays an empty bag count unless already positive: ${bagsReceived}`, async () => {
    const { state } = fixture({ check: async () => ({ data: { success: true, hamperId: 'HC10DC-004B', bagsReceived } }) });
    await state.onDecode('HC10DC-004B');
    assert.equal(state.numberOfBags, Number(bagsReceived) > 0 ? bagsReceived : '');
  });
}

test('late camera failure cannot overwrite a newer successful camera session', async () => {
  const { state } = fixture();
  let reject;
  const pending = state.onInit(new Promise((resolve, fail) => { reject = fail; }));
  await state.onInit(Promise.resolve());
  reject(Error('old camera interrupted'));
  await pending;
  assert.equal(state.cameraError, undefined);
  assert.equal(state.cameraStarting, false);
});

test('camera restart preserves entered details and is blocked during a lookup', () => {
  const { state } = fixture();
  state.retryCamera();
  assert.equal(state.hamperId, 'hc04hl012');
  assert.equal(state.numberOfBags, 2);
  assert.equal(state.cameraKey, 1);
  state.loading = true;
  state.retryCamera();
  assert.equal(state.cameraKey, 1);
});
