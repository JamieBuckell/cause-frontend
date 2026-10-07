const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../src/services/donorAllocations.js'), 'utf8')
 .replace(/^import .*;\n/gm, '').replace('export const ', 'const ').replace('export async function ', 'async function ');
function setup({ decisions = [], references = ['AB-001'], fail = false } = {}) {
 const calls = [], dialogs = [];
 const context = {
  Swal: { fire: async options => { dialogs.push(options); return decisions.shift() || { isConfirmed: true, value: 'request' }; } },
  reconnectDonorAllocations: async body => { calls.push(JSON.parse(JSON.stringify(body))); if(fail)throw Error('Source changed');
   return {data:body.action==='preview'?{references,targetRequestId:'request',fingerprint:'snapshot'}:{donor:{GSI2PK:'donor'},reconnected:references}};
  },
 };
 vm.runInNewContext(source+';globalThis.api={editablePledges,reconnectAssignments};',context);
 return {...context.api,calls,dialogs};
}
const donor = {GSI2PK:'donor',familyDetails:{request:[{requestId:'request',numberOfFamilies:1,allocation:[]}]}};
test('editing submits only preferences without mutating saved pledge or allocations',()=>{
 const f=setup();const original=[{requestId:'request',numberOfFamilies:1,familyDetail:['single'],allocation:[{hamperId:'AB-001',members:[{who:'Adult'}]}]}];
 const before=JSON.stringify(original);
 const result=f.editablePledges(original,{...original[0],numberOfFamilies:2,familyDetail:['small','small']},0);
 assert.equal(JSON.stringify(original),before);assert.equal(result[0].numberOfFamilies,2);assert.equal(result[0].allocation,undefined);
});
test('cancelled repair preview cannot apply a repair',async()=>{
 const f=setup({decisions:[{isConfirmed:false}]});assert.equal(await f.reconnectAssignments(donor,'TEST'),null);
 assert.equal(f.calls.length,1);assert.equal(f.calls[0].action,'preview');
});
test('repair confirmation uses the returned snapshot and target pledge',async()=>{
 const f=setup();await f.reconnectAssignments(donor,'TEST');assert.equal(f.calls.length,2);
 assert.equal(f.calls[1].fingerprint,'snapshot');assert.equal(f.calls[1].targetRequestId,'request');assert.equal(f.calls[1].action,'repair');
});
test('cancelled pledge selection has no server side effects',async()=>{
 const f=setup({decisions:[{isConfirmed:false}]});const multi={...donor,familyDetails:{request:[...donor.familyDetails.request,{requestId:'second',numberOfFamilies:1}]}};
 await f.reconnectAssignments(multi,'TEST');assert.equal(f.calls.length,0);
});
test('already correct allocations make no write request',async()=>{
 const f=setup({references:[]});await f.reconnectAssignments(donor,'TEST');assert.equal(f.calls.length,1);
});
test('backend conflicts propagate without a second repair request',async()=>{
 const f=setup({fail:true});await assert.rejects(f.reconnectAssignments(donor,'TEST'),/Source changed/);assert.equal(f.calls.length,1);
});

test('a submit event cannot be mistaken for a delete request',()=>{
 const f=setup();const requests=[{requestId:'request',numberOfFamilies:1}];
 const result=f.editablePledges(requests,{requestId:'request',numberOfFamilies:2},0,{type:'submit'});
 assert.equal(result.length,1);assert.equal(result[0].numberOfFamilies,2);
});
