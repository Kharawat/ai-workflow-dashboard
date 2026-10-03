import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runtime } from './browser-fixture.mjs';
test('stored workflow HTML cannot escape attributes or inject status markup', () => {
  const r=runtime({storage:{'phoom-ai-workflow-dashboard':JSON.stringify([{id:'" onclick="attack()',name:'<img src=x onerror=attack()>',status:'<svg onload=attack()>',impact:'" onclick="attack()',hours:'Infinity'}])}});
  const html=r.node('#workflowRows').children.map(n=>n.innerHTML).join('');
  assert.doesNotMatch(html,/<img|<svg|data-delete="" onclick=/);
  assert.match(html,/&lt;img/);
  assert.equal(r.run('workflows[0].status'),'Idea');
  assert.equal(r.run('workflows[0].hours'),0);
});
test('malformed storage cannot break startup', () => {
  for(const item of [null,{},[],{id:42,name:[]}]) assert.doesNotThrow(()=>runtime({storage:{'phoom-ai-workflow-dashboard':JSON.stringify([item])}}));
});
test('CSV neutralizes text formulas and preserves numeric values and quotes', () => {
  const r=runtime();
  for(const text of ['=1+1','+SUM(1)','-2','@SUM(1)',' \t=1']) assert.equal(r.context.csvCell(text),'"\''+text+'"');
  assert.equal(r.context.csvCell(-2),'"-2"');
  assert.equal(r.context.csvCell('say "hi"'),'"say ""hi"""');
});
