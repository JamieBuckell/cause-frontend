const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/components/Cards/ListingsPage.vue'), 'utf8')
  .split('<script>')[1].split('</script>')[0]
  .replace(/^import .*;\n/gm, '').replace('export default', 'globalThis.component =');
const context = { Vue: { prototype: {} }, MessageBox: {}, Dialog: {}, Select: {}, Option: {}, Table: {}, TableColumn: {}, LPagination: {}, NominatorDetail: {}, DonorDetail: {} };
vm.runInNewContext(source, context);
const component = context.component;
function setup(rows) {
  const saved = { perPage: 50, currentPage: 28, total: 1661 };
  const state = component.data.call({ paginateOptions: { perPage: 50 }, listingsType: 'families', options: { columns: [], searchKeys: ['reference'] }, $store: { getters: { getPaginationData: () => saved } } });
  Object.assign(state, component.methods, { paginateOptions: { perPage: 50 }, tableData: rows, $emit: () => {} });
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  return { state, saved };
}
test('donor tables show all 50 families despite the saved main-list page 28', () => {
  const rows = Array.from({ length: 50 }, (_, i) => ({ reference: `AG${i}` }));
  const { state, saved } = setup(rows);
  assert.equal(state.pagination.currentPage, 1);
  assert.equal(state.queriedData.length, 50);
  state.pagination.currentPage = 2;
  assert.equal(saved.currentPage, 28);
  assert.equal(setup(rows).state.pagination.currentPage, 1);
});
test('search on page 28 finds ED01 and paginates the matching results', () => {
  const rows = Array.from({ length: 1661 }, (_, i) => ({ reference: i === 0 ? 'ED01' : `MC${i}` }));
  const { state } = setup(rows);
  state.pagination.currentPage = 28;
  state.fuseSearch = { search: () => [{ score: 0, item: rows[0] }] };
  state.searchQuery = 'ed01';
  component.watch.searchQuery.call(state);
  assert.equal(state.pagination.currentPage, 1);
  assert.equal(state.total, 1);
  assert.equal(state.queriedData[0].reference, 'ED01');
  state.searchQuery = '';
  component.watch.searchQuery.call(state);
  assert.equal(state.total, 1661);
});
test('filters reset the page and a search without matches has zero entries', () => {
  const { state } = setup([{ reference: 'ED01' }]);
  state.initFuse = () => {};
  state.pagination.currentPage = 28;
  component.watch.listingsData.call(state, []);
  assert.equal(state.pagination.currentPage, 1);
  state.searchQuery = 'missing';
  state.fuseSearch = { search: () => [] };
  assert.equal(state.total, 0);
  assert.equal(state.queriedData.length, 0);
});
