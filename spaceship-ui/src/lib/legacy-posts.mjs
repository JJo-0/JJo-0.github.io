const LEGACY_SOURCE_FILENAMES = [
  '2022-09-20-블로그를 시작하면서.md',
  '2022-09-26-python_변수.md',
  '2022-10-26-데이터베이스(1).md',
  '2023-03-24-Survey JS 설명.md',
  '2023-06-20-자료구조(1).md',
  '2023-06-28-코딩테스트 기본지식.md',
  '2023-07-06-SLAM(1).md',
  '2023-07-06-SLAM(2).md',
  '2023-07-11-코딩테스트 자료구조 (1).md',
  '2023-07-11-코딩테스트 자료구조 (2).md',
  '2023-07-13-ROS2 소개.md',
  '2023-07-26-ROS2 개발환경 구축.md',
  '2023-08-08-ROS2 노드와 데이터.md',
  '2024-01-18-SOEM의이해.md',
  '2024-01-19-머신러닝 정리.md',
  '2024-02-01-PHM.md',
  '2024-03-17-English_word.md',
  '2024-04-05-Raspberry pi 5 설정.md',
  '2024-04-08-Docker 설정.md',
  '2024-05-02-힙 Heap copy.md',
  '2024-06-04-자료구조1.md',
  '2024-06-04-자료구조2.md',
  '2024-08-09-숫자야구.md',
  '2024-10-29-python 코드 분석_1.md',
  '2024-12-26-Human Height Estimation.md',
  '2025-01-20-AlphaPose_Model.md',
  '2025-02-07-Human_forecasting.md',
  '2025-02-07-Human_pose_estimate.md',
  '2025-02-18-Vision_공부.md',
  '2025-03-07-양산선물.md',
  '2025-03-18-Calibration.md',
  '2025-04-25-평가지표.md',
  '2025-05-08-선형대수.md',
  '2025-05-16-Mordern_Artificial_Intelligence.md',
  '2025-05-20-지속적인_보통_수준의_카페인_섭취.md',
  '2025-05-23-Deep_Search_gemini.md',
  '2025-05-23-Deep_Search_travel_prompt.md',
  '2025-06-17-linux_단축어.md',
  '2025-06-27-맞춤_마그네슘_영양제_선택.md',
  '2025-07-23-맞춤_비타민B_영양제_선택.md',
  '2025-07-23-맞춤_오메가3_영양제_선택.md',
  '2025-07-25-인간의_시각.md',
  '2025-08-06-당뇨병_통합관리.md',
  '2025-11-08-로봇강화학습_성공사례.md',
  '2026-03-30-Venture-Global-Comprehensive-Report.md',
  '2027-01-15-AI 아키텍처.md',
];

// This taxonomy is the final Jekyll category hierarchy from
// _data/para_mapping.yml immediately before the Astro migration.
export const LEGACY_CATEGORY_TAXONOMY = [
  ['projects', 'computer-vision'],
  ['projects', 'ai-research'],
  ['projects', 'web-development'],
  ['projects', 'robotics'],
  ['areas', 'health-wellness'],
  ['areas', 'neuroscience'],
  ['areas', 'programming'],
  ['areas', 'system-setup'],
  ['resources', 'study-notes'],
  ['resources', 'tools-guides'],
  ['resources', 'code-analysis'],
  ['resources', 'research-papers'],
  ['archive', 'blog-setup'],
  ['archive', 'legacy-projects'],
  ['archive', 'experiments'],
];

function sourceDate(filename) {
  return filename.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
}

function sourceBase(filename) {
  return filename.replace(/\.md$/i, '').replace(/^\d{4}-\d{2}-\d{2}-?/, '').trim();
}

// Exact algorithm used by scripts/migrate_posts.py in bb4e4788: NFKD,
// drop non-ASCII, lowercase, spaces/underscores -> hyphen, then clean.
function migrationSlugify(value) {
  const ascii = [...value.normalize('NFKD')]
    .filter((character) => (character.codePointAt(0) ?? 128) <= 0x7f)
    .join('');

  return ascii
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Jekyll's :title placeholder uses slugify(..., 'pretty') and preserves case.
// Pretty mode preserves Unicode letters/numbers and URL-safe punctuation such
// as underscores while replacing whitespace and other separators with '-'.
export function jekyllPrettyTitle(filename) {
  return sourceBase(filename)
    .replace(/[^\p{L}\p{N}_\-.~!$&'()+,;=@]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const seenMigrationSlugs = new Map();

export const LEGACY_SOURCE_POSTS = LEGACY_SOURCE_FILENAMES.map((filename) => {
  const date = sourceDate(filename);
  const base = sourceBase(filename);
  let id = migrationSlugify(base);
  if (id.length < 3) id = date || 'post';

  const count = (seenMigrationSlugs.get(id) ?? 0) + 1;
  seenMigrationSlugs.set(id, count);
  if (count > 1) id = `${id}-${count}`;

  return Object.freeze({
    filename,
    date,
    id,
    titlePath: jekyllPrettyTitle(filename),
  });
});

export function inferLegacyCategoryPath(tags = []) {
  const normalized = new Set(tags.map((tag) => String(tag).toLowerCase()));
  const matches = LEGACY_CATEGORY_TAXONOMY.filter(([parent, child]) =>
    normalized.has(parent) && normalized.has(child)
  );

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one legacy category hierarchy; found ${matches.length} for tags: ${[...normalized].join(', ')}`
    );
  }

  return matches[0].join('/');
}

export function legacyPathForPost(source, tags) {
  return `/${inferLegacyCategoryPath(tags)}/${source.titlePath}/`;
}

export function isLegacyPathname(pathname) {
  return /^\/(?:projects|areas|resources|archive)\//i.test(pathname);
}
