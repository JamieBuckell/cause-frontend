const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const apiSource = fs.readFileSync(path.join(__dirname, '../src/api/communications.api.js'), 'utf8').replace(/^import .*;\n/gm, '').replace(/export const /g, 'const ');
const componentSource = fs.readFileSync(path.join(__dirname, '../src/pages/Communications/Issues.vue'), 'utf8').split('<script>')[1].split('</script>')[0]
 .replace(/^import .*;\n/gm, '').replace('export default', 'globalThis.component =');
function setup({ response = { status: 400, data: { message: 'Review changed, refresh' } }, page = {}, failSave = false } = {}) {
 const context = { httpClient: { get: async () => response, post: async () => response }, Dialog: { name: 'el-dialog' },
  getEmailIssues: async () => ({ data: { issues: [], nextCursor: null, ...page } }),
  reviewEmailIssue: async () => { if (failSave) throw Error('Save failed'); return { data: { issue: { id: 'one', reviewStatus: 'resolved' } } }; },
 };
 vm.runInNewContext(apiSource + ';globalThis.api = { getEmailIssues, reviewEmailIssue };', context);
 // Isolate component imports from the API bindings for deterministic UI behavior tests.
 const viewContext = { Dialog: context.Dialog, getEmailIssues: context.getEmailIssues, reviewEmailIssue: context.reviewEmailIssue };
 vm.runInNewContext(componentSource, viewContext);
 const view = viewContext.component.data();
 for (const [name, fn] of Object.entries(viewContext.component.methods)) view[name] = fn.bind(view);
 return { api: context.api, view };
}
test('resolved HTTP error responses cannot masquerade as successful reviews or lists', async () => {
 const { api } = setup(); await assert.rejects(api.getEmailIssues({}), /Review changed/); await assert.rejects(api.reviewEmailIssue({}), /Review changed/);
});
test('an empty scan page retains its cursor so later issues remain reachable', async () => {
 const { view } = setup({ page: { nextCursor: 'next-page' } }); await view.loadMore(); assert.equal(view.nextCursor, 'next-page'); assert.equal(view.issues.length, 0);
});
test('failed review save leaves dialog and existing review intact', async () => {
 const { view } = setup({ failSave: true }); const issue = { id: 'one', reviewStatus: 'open', note: '' };
 view.issues = [issue]; view.openReview(issue); await view.saveReview();
 assert.equal(view.showReview, true); assert.equal(view.issues[0].reviewStatus, 'open'); assert.ok(view.saveError); assert.equal(view.saving, false);
});
test('successful review updates the row and closes the dialog', async () => {
 const { view } = setup(); const issue = { id: 'one', reviewStatus: 'open', note: '' };
 view.issues = [issue]; view.openReview(issue); await view.saveReview(); assert.equal(view.issues[0].reviewStatus, 'resolved'); assert.equal(view.showReview, false);
});
