import assert from 'node:assert/strict';
import disclosure from '../src/lib/rehype/news-source-disclosure.mjs';
const text = value => ({type:'text',value});
const heading = (tagName,value) => ({type:'element',tagName,properties:{id:'sources'},children:[text(value)]});
const reference = n => ({type:'mdxJsxFlowElement',name:'a',attributes:[{name:'data-news-reference',value:String(n)}],children:[text('Original full source and rights record')]});
const limit = {type:'element',tagName:'p',children:[text('Core limitation must stay visible')]};
for (const title of ['출처·도판 권리와 열람 범위','출처와 열람 범위','원문·그림·수식의 출처','원문·그림 사용 범위']) {
  const original = [heading('h2',title),reference(1),reference(2)];
  const next = heading('h2','다음 본문');
  const tree = {type:'root',children:[limit,...original,next]};
  disclosure()(tree);
  assert.equal(tree.children[0],limit);
  assert.equal(tree.children[1].tagName,'details');
  assert(!tree.children[1].properties.open);
  assert(tree.children[1].children[0].children[0].value.endsWith('(2)'));
  assert.deepEqual(tree.children[1].children[1].children,original);
  assert.equal(tree.children[2],next);
  const once = JSON.stringify(tree); disclosure()(tree); assert.equal(JSON.stringify(tree),once);
}
const subheading = heading('h3','원문·그림·수식의 출처');
const codeBoundary = heading('h3','코드와 수식의 경계 확인');
const agent = {children:[subheading,reference(1),codeBoundary,text('Unchanged audit boundary')]};
disclosure()(agent);
assert.deepEqual(agent.children[0].children[1].children,[subheading,reference(1),codeBoundary,text('Unchanged audit boundary')]);
for (const tree of [{children:[heading('h2','출처·도판 권리와 열람 범위'),text('No registered reference')]},{children:[heading('h2','안전성과 한계'),reference(1)]}]) {
  const before = JSON.stringify(tree); disclosure()(tree); assert.equal(JSON.stringify(tree),before);
}
console.log('PASS source disclosure: four titles, exact node preservation, section boundary, collapsed default, count, idempotence, no unrelated/empty folding');
