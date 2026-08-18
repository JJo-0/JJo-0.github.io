import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const TARGET_BRANCH = 'agent/modern-ai-eight-part-map';
const TARGET_FILE = 'site/content/posts/mordern-artificial-intelligence.mdx';
const filePath = path.resolve(process.cwd(), TARGET_FILE);
const oldTitle = "title: '현대 인공지능 I — AI·ML·DL에서 확률·최적화까지: 1장 전체'";
const newTitle = "title: '현대 인공지능 I — AI·ML·DL에서 확률·최적화까지'";
const replacement = `## 시리즈 구성

이 시리즈는 **실제로 확보한 ECE5992 강의자료**를 기준으로 구성한다. 1장 통합판인 현재 글과 후속 PDF 7개를 합쳐 **총 8편**이며, 번호를 맞추기 위한 빈 글이나 자리 채우기용 게시물은 만들지 않는다.

상단의 **8편 학습 지도**는 다음 흐름을 한 화면에서 보여준다.

**기초 수학·확률 → 머신러닝 일반화 → 퍼셉트론·CNN → 기울기 최적화 → 이미지 분류 → 의미론적 분할 → VAE·확산모델 → 대조 표현학습**

후속 글이 공개되면 구성도의 해당 항목이 자동으로 링크로 바뀐다. 따라서 이 글 안에 PDF 파일명 중심의 중복 표를 다시 두지 않는다.

`;
const seriesPattern = /## 시리즈 지도\n[\s\S]*?(?=## 원자료 표기 감사)/;

function migrate(source) {
  if (source.includes('## 시리즈 구성') && source.includes(newTitle)) return null;
  if (!source.includes(oldTitle)) {
    throw new Error('patch-modern-ai-source-once: expected Part I title was not found');
  }
  if (!seriesPattern.test(source)) {
    throw new Error('patch-modern-ai-source-once: obsolete nine-part series section was not found');
  }

  let migrated = source.replace(oldTitle, newTitle);
  migrated = migrated.replace(/^updatedDate:\s*[^\n]+$/m, 'updatedDate: 2026-08-18');
  migrated = migrated.replace(seriesPattern, replacement);

  for (const forbidden of ['전체 시리즈는 **9편**', '| 6 | 원자료 대기', '아직 업로드되지 않음']) {
    if (migrated.includes(forbidden)) {
      throw new Error(`patch-modern-ai-source-once: obsolete source text remains: ${forbidden}`);
    }
  }
  return migrated;
}

if (
  process.env.GITHUB_ACTIONS !== 'true' ||
  process.env.GITHUB_EVENT_NAME !== 'pull_request' ||
  process.env.GITHUB_HEAD_REF !== TARGET_BRANCH
) {
  console.log('patch-modern-ai-source-once: not the intended same-repository PR run; no-op');
  process.exit(0);
}

if (migrate(fs.readFileSync(filePath, 'utf8')) === null) {
  console.log('patch-modern-ai-source-once: source is already migrated; no-op');
  process.exit(0);
}

execFileSync(
  'git',
  ['fetch', 'origin', `refs/heads/${TARGET_BRANCH}:refs/remotes/origin/${TARGET_BRANCH}`],
  { stdio: 'inherit' },
);
execFileSync('git', ['checkout', '-B', TARGET_BRANCH, `refs/remotes/origin/${TARGET_BRANCH}`], {
  stdio: 'inherit',
});

const migrated = migrate(fs.readFileSync(filePath, 'utf8'));
if (migrated === null) {
  console.log('patch-modern-ai-source-once: remote branch was already migrated; no-op');
  process.exit(0);
}
fs.writeFileSync(filePath, migrated, 'utf8');

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { stdio: 'inherit' });
execFileSync(
  'git',
  ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'],
  { stdio: 'inherit' },
);
execFileSync('git', ['add', TARGET_FILE], { stdio: 'inherit' });
execFileSync('git', ['commit', '-m', 'fix: make the Modern AI eight-part map source-native'], {
  stdio: 'inherit',
});
execFileSync('git', ['push', 'origin', `HEAD:refs/heads/${TARGET_BRANCH}`], {
  stdio: 'inherit',
});

console.log('patch-modern-ai-source-once: source migration committed and pushed');
