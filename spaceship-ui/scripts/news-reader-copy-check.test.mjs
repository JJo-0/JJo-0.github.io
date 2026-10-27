import assert from 'node:assert/strict';
import { editorialLeaks } from './news-reader-copy-check.mjs';
assert.deepEqual(editorialLeaks('---\nstatus: BACKLOG_CANDIDATE\n---\n생쥐 대상 연구다.\n## 출처\nhttps://doi.org/10.1234/test\n<details>\n<summary>원문 확인 범위</summary>\n보충자료 대조는 미완료다.\n</details>'), []);
assert.deepEqual(editorialLeaks('```yaml\nstatus: BACKLOG_CANDIDATE\n```\n설명'), []);
assert.deepEqual(editorialLeaks('~~~text\nPEER_REVIEWED_FRONTIER\n~~~\n설명'), []);
for (const text of ['BACKLOG_CANDIDATE', '**rank/contentId/status:** 3', '## 후보 기록', 'SELECTED · 1위 · 93/100', 'PEER_REVIEWED_FRONTIER', '<details>BACKLOG_CANDIDATE</details>']) assert(editorialLeaks(text).length > 0, text);
console.log('PASS reader-copy regression: metadata leakage rejected; sources, limitations, frontmatter and examples preserved');

assert.deepEqual(editorialLeaks(JSON.stringify({stage: 'QA', articleProgress: {}})), ['non-article-json']);
