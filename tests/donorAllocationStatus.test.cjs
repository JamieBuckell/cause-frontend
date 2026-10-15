const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../src/pages/Donors/View.vue'), 'utf8');
const method = source.slice(source.indexOf('    formatStatus(campaign) {'), source.indexOf('    async doConfirmAllocation('));
const methods = vm.runInNewContext('({' + method + '})');
function status(count, allocated, confirmed) {
 const allocation = Array.from({ length: allocated }, (_, i) => ({ hamperId: `F-${i}` }));
 const families = allocation.map((a, i) => ({ GSI2SK: `SK#${a.hamperId}`, status: i < confirmed ? 'allocated-confirmed' : 'allocated-unconfirmed' }));
 return methods.formatStatus.call({ donor: { families } }, { numberOfFamilies: count, allocation });
}
for (const count of [9, '9']) {
 test(`nine allocated and confirmed with ${typeof count} pledge count`, () => {
  assert.equal(status(count, 9, 9), 'Fully Allocated - Confirmed');
 });
 test(`additional families awaiting confirmation with ${typeof count} pledge count`, () => {
  assert.equal(status(count, 9, 7), 'Fully Allocated - Part Confirmed');
  assert.equal(status(count, 7, 7), 'Part Allocated - Part Confirmed');
  assert.equal(status(count, 9, 0), 'Fully Allocated - Unconfirmed');
  assert.equal(status(count, 0, 0), 'Unallocated');
 });
}
