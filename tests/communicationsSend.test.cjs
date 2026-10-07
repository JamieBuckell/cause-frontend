const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/services/communicationsSend.js'), 'utf8')
  .replace(/^import .*;\n/gm, '').replace('export async function', 'async function');
const payload = { options: {type:'nominators', campaignId:'TEST'}, email: {subject:'Deadline', content:'Hello'} };
function setup({ decisions = [], failSend = false, status = 'PREVIEW' } = {}) {
 const data = new Map(), requests = [], dialogs = [];
 let failed = false;
 const context = {
  window:{crypto:{getRandomValues:array=>crypto.randomFillSync(array)}},
  sessionStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},
  Swal:{fire:async options=>{dialogs.push(options);return decisions.shift() || {isConfirmed:true}}},
  sendEmail:async body=>{requests.push(JSON.parse(JSON.stringify(body)));if(body.action==='send'&&failSend&&!failed){failed=true;throw Error('Lost response')}
   return {status:200,data:body.action==='preview'?{status,count:1,recipients:[{email:'safe@example.org',roles:['nominator']}],duplicateCount:0,previouslySentCount:0,campaignId:'TEST',expiresAt:Date.now()+100000}:{message:'Queued'}};
  },
 };
 context.previewEmail = context.sendEmail;
 vm.runInNewContext(source+';globalThis.send=previewAndSendEmail;',context);
 return {send:context.send,requests,dialogs,data};
}
test('cancelled preview does not send or retain a draft',async()=>{
 const f=setup({decisions:[{isConfirmed:false}]});assert.equal(await f.send(payload),false);assert.equal(f.requests.length,1);assert.equal(f.data.size,0);
});
test('confirmation sends only the preview request ID',async()=>{
 const f=setup();assert.equal(await f.send(payload),true);assert.equal(f.requests[1].action,'send');assert.equal(f.requests[1].requestId,f.requests[0].requestId);assert.equal(f.data.size,0);
});
test('lost send acknowledgement reuses the exact same request ID on retry',async()=>{
 const f=setup({failSend:true});await assert.rejects(f.send(payload));const id=f.requests[0].requestId;assert.equal(f.data.size,1);await f.send(payload);assert.ok(f.requests.every(r=>r.requestId===id));
});
test('confirmed pending mailing can be recovered when the editor contents have changed',async()=>{
 const f=setup({failSend:true});await assert.rejects(f.send(payload));const id=f.requests[0].requestId;await f.send({...payload,email:{subject:'Different',content:'New'}});assert.ok(f.requests.every(r=>r.requestId===id));assert.equal(f.data.size,0);
});
test('already queued preview clears pending state without another send request',async()=>{
 const f=setup({status:'QUEUED'});assert.equal(await f.send(payload),true);assert.equal(f.requests.length,1);assert.equal(f.data.size,0);
});
