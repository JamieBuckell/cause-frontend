const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const component = fs.readFileSync(path.join(root, "src/components/Cards/DonorDetail.vue"), "utf8").split("<script>")[1].split("</script>")[0].replace(/^import .*;\n/gm, "").replace("export default", "globalThis.component =");
function fixture({ admin = true, fail = false } = {}) {
  const calls = [], dialogs = [];
  const context = { verifyDonorManually: async (...args) => { calls.push(args); if (fail) throw Error("Request failed"); }, Swal: { fire: async data => dialogs.push(data) } };
  vm.runInNewContext(component, context);
  const state = { ...context.component.data(), rowData: { GSI2PK: "donor", GSI3PK: "person+alias@example.com" }, userInGroup: group => admin && group === "Admin", $store: { getters: { getActiveCampaign: "CHC2026" } } };
  return { state, calls, dialogs, run: () => context.component.methods.manualVerification.call(state) };
}
test("manual verification uses donor email and active campaign, then hides completed action", async () => {
  const f = fixture(); await f.run();
  assert.deepEqual(f.calls, [["person+alias@example.com", "CHC2026"]]);
  assert.equal(f.state.manuallyVerified, true);
  assert.equal(f.state.verificationPending, false);
});
test("failure is displayed and clears the spinner without marking verified", async () => {
  const f = fixture({ fail: true }); await f.run();
  assert.equal(f.state.manuallyVerified, false);
  assert.equal(f.state.verificationPending, false);
  assert.equal(f.dialogs[0].icon, "error");
});
test("non-admin and repeated pending clicks make no request", async () => {
  const f = fixture({ admin: false }); await f.run(); assert.equal(f.calls.length, 0);
  const pending = fixture(); pending.state.verificationPending = true; await pending.run(); assert.equal(pending.calls.length, 0);
});
test("manual API uses POST without a blank verification token and rejects resolved error responses", async () => {
  const calls = [];
  const source = fs.readFileSync(path.join(root, "src/api/donors.api.js"), "utf8").replace(/^import .*;\n/gm, "").replace(/export const /g, "const ");
  const context = { requiredPathParam: value => encodeURIComponent(value), httpClient: { post: async url => { calls.push(url); return { status: 400, data: { messages: { error: "Cannot verify" } } }; } } };
  vm.runInNewContext(source + ";globalThis.manual = verifyDonorManually;", context);
  await assert.rejects(context.manual("person+alias@example.com", "CHC2026"), /Cannot verify/);
  assert.equal(calls[0], "/subscription/verify/person%2Balias%40example.com?campaignId=CHC2026");
});
