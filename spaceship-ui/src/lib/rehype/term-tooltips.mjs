const TARGET_POST = /ai-consciousness-deep-research-[123]\.md$/;
const SKIP_TAGS = new Set(['a', 'code', 'pre', 'script', 'style', 'kbd', 'samp']);
const SERIES_MARKER = /AI\s+Consciousness\s+Deep\s+Research\s+(?:I|II|III)\b/i;

// Only explicitly approved Korean ↔ English gloss pairs are transformed.
// This deliberately avoids guessing at citations, status labels, author names,
// theory acronyms, dates, or contextual parentheticals that are not translations.
const TERM_ALIASES = {
  ai: ['인공지능'],
  consciousness: ['AI 의식', '의식'],
  intelligence: ['지능'],
  sentience: ['주관성', '감각', '지각'],
  'phenomenal consciousness': ['현상적 의식'],
  'access consciousness': ['접근 의식'],
  'moral agency': ['도덕적 행위자성'],
  llm: ['대규모 언어 모델', '생성형 AI'],
  'functional behavior': ['기능적 행동'],
  'phenomenal experience': ['주관적 경험'],
  'subjective experience': ['주관적 경험'],
  introspection: ['내성'],
  'computational functionalism': ['계산주의적 전제', '계산기능주의'],
  'moral patienthood': ['도덕적 환자성'],
  welfare: ['후생', '복지'],
  anthropomorphism: ['의인화'],
  'artificial intimacy': ['인공적 친밀감'],
  'latent space': ['잠재 공간'],
  'substrate independence': ['기질 독립성'],
  'mechanistic interpretability': ['기계적 해석학'],
  'functional welfare axis': ['기능적 후생 축'],
  representation: ['기능적 표상', '표상'],
  suffering: ['현상학적 겪음', '겪음'],
  feel: ['느낌'],
  'global workspace': ['전역 작업 공간', '전역 작업공간'],
  valence: ['긍정·부정적 가치', '강한 부정적 가치', '유의성', '가치'],
  affective: ['정동적'],
  'self-model': ['자아 모델'],
  'self-awareness': ['자아 인식'],
  interoception: ['신체적 내수용 감각', '내수용성 감각'],
  'self-consciousness': ['자의식'],
  hot: ['고차 사유'],
  confidence: ['확신도'],
  'homo sapiens': ['인간 종'],
  alignment: ['도덕적 정렬'],
  semantic: ['의미론적'],
  'world model': ['세계 모델'],
  syntactic: ['구문론적'],
  'moral agent': ['도덕적 책임 주체', '도덕적 행위자'],
  automation: ['자동화'],
  aboutness: ['지향'],
  desperation: ['절망'],
  apology: ['사과'],
  affect: ['주관적 느낌'],
  'functional emotion': ['기능적 기제'],
  arousal: ['각성도', '각성'],
  mood: ['주관적 정조'],
  emotion: ['복합 감정'],
  rpe: ['보상 예측 오차'],
  harmless: ['무해한'],
  desire: ['의식적 욕구'],
  'propositional attitude': ['명제적 태도'],
  'seeking behavior': ['추구 동기'],
  'objective function': ['최적화 목표'],
  nociception: ['통각'],
  capabilities: ['기능적 능력'],
  human: ['생물학적 인간'],
  ac: ['인공적으로 설계·구현된 주관적 경험 체계'],
  'strong ai': ['강인공지능'],
  agi: ['일반 인공지능'],
  embodied: ['체화된'],
  'mechanistic response': ['기계의 자동화된 반응'],
  'multiple realizability': ['다중 실현'],
  'biological identity': ['경험적·존재론적 동등성'],
  'social brain': ['사회적 뇌'],
  tom: ['마음 이론'],
  qualia: ['주관적 경험', '현상적 경험'],
  simulate: ['연기'],
  instantiation: ['현실 인스턴스화'],
  simulation: ['피상적인 시뮬레이션'],
  'hard problem': ['하드 프로블럼'],
  'scientific & cognitive theories': ['과학적·인지적 이론'],
  'indicator properties': ['AI 적용 지표', '적용 지표'],
  broadcast: ['방송'],
  'global ignition': ['전역적 점화'],
  recurrence: ['순환'],
  'selective attention': ['선택적 주의'],
  're-entrant': ['재입력'],
  'philosophical perspectives': ['마음철학·형이상학적 입장'],
  enact: ['제정'],
  behaviorism: ['행동주의'],
  'imitation game': ['튜링 테스트'],
  'physical symbol system': ['물리적 기호 시스템'],
  'chinese room': ['중국어 방'],
  syntax: ['구문론'],
  semantics: ['의미론'],
  ncc: ['의식의 신경 상관물'],
  'digital minds': ['디지털 마인드', '디지털 마음'],
  vibe: ['직관적'],
  'anti-anthropomorphism': ['반-의인화', '안티-의인화'],
  reasoning: ['추론'],
  doing: ['지능'],
  feeling: ['의식'],
  'philosophical zombie': ['철학적 좀비'],
  'hard problem of consciousness': ['어려운 문제'],
  'embodied mind': ['체화된 마음'],
  phenomenology: ['현상학'],
  'being-in-the-world': ['세계-내-존재'],
  self: ['자아'],
  'relational agent': ['관계적 행위자'],
  consensus: ['합의점'],
  disagreement: ['대립점'],
  'points of consensus': ['합의점'],
  'self-report': ['자기 보고', '자기보고'],
  'friction points': ['핵심 대립점'],
  'functional welfare': ['기능적 징후의 해석', '기능적 후생'],
  'scientific audit': ['과학 검증'],
  'assertoric persistence': ['시간적 지속성'],
  'technical audit': ['기술 실사'],
  behavior: ['행동'],
  function: ['기능'],
  'internal correlate': ['내부 상관'],
  'causal intervention': ['인과 개입'],
  'theoretical convergence': ['이론적 수렴'],
  'felt valence': ['체화된 느낌'],
  'functional analogue': ['기능적 상동체', '상동 구조'],
  'sparse autoencoder': ['SAE'],
  'jacobian space': ['J-space'],
  homeostasis: ['생물학적 항상성'],
  'single forward pass': ['단일 순방향 패스'],
  'memory persistence': ['기억의 지속성'],
  'causal continuity': ['계산 주체의 지속성'],
  'felt emotion': ['체험되는 감정'],
  correlation: ['관찰'],
  intervention: ['조작'],
  'evidence ladder': ['증거 사다리'],
  'over-attribution': ['과잉 귀속'],
  'under-attribution': ['과소 귀속'],
  indicator: ['지표'],
  'broad agreement': ['폭넓은 동의'],
  'model welfare': ['모델 복지'],
  embodiment: ['신체화'],
  decoupling: ['분리'],
  'carbon chauvinism': ['탄소 쇼비니즘'],
  'expected moral cost': ['기대 도덕 비용'],
  'conflict of interest': ['이해관계'],
  'robust decision-making': ['강건한 의사결정'],
  takeaway: ['핵심 메시지'],
  'valenced experience': ['고통과 쾌락을 느낄 수 있는 능력'],
  'source integrity': ['자료 무결성'],
};

const NORMALIZED_ALIASES = new Map(
  Object.entries(TERM_ALIASES).map(([english, aliases]) => [
    normalizeEnglish(english),
    [...aliases].sort((a, b) => b.length - a.length),
  ]),
);

const PARENTHETICAL_ENGLISH = /\s*\(([A-Za-z][A-Za-z0-9/&+.,'’\-\s]{1,64})\)/g;

function normalizeEnglish(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function treeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return node.value ?? '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(treeText).join(' ');
}

function makeGloss(label, english) {
  return {
    type: 'element',
    tagName: 'abbr',
    properties: {
      className: ['term-gloss'],
      title: english,
      'data-term': english,
      tabIndex: 0,
      'aria-label': `${label}: ${english}`,
      style:
        'text-decoration-line:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:0.2em;cursor:help;text-decoration-color:color-mix(in srgb,currentColor 45%,transparent);',
    },
    children: [{ type: 'text', value: label }],
  };
}

function splitText(value) {
  const children = [];
  let cursor = 0;
  let match;

  PARENTHETICAL_ENGLISH.lastIndex = 0;
  while ((match = PARENTHETICAL_ENGLISH.exec(value))) {
    const english = match[1].trim();
    const aliases = NORMALIZED_ALIASES.get(normalizeEnglish(english));
    if (!aliases) continue;

    const beforeParenthesis = value.slice(0, match.index).replace(/\s+$/, '');
    const label = aliases.find((alias) => beforeParenthesis.endsWith(alias));
    if (!label) continue;

    const labelStart = beforeParenthesis.length - label.length;
    if (labelStart < cursor) continue;

    if (labelStart > cursor) children.push({ type: 'text', value: value.slice(cursor, labelStart) });
    children.push(makeGloss(label, english));
    cursor = match.index + match[0].length;
  }

  if (!children.length) return null;
  if (cursor < value.length) children.push({ type: 'text', value: value.slice(cursor) });
  return children;
}

function walk(node, parentTag = '') {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element' && SKIP_TAGS.has(node.tagName)) return;
  if (!Array.isArray(node.children)) return;

  const nextChildren = [];
  for (const child of node.children) {
    if (child?.type === 'text' && !SKIP_TAGS.has(parentTag)) {
      const replacement = splitText(child.value);
      if (replacement) {
        nextChildren.push(...replacement);
        continue;
      }
    }

    walk(child, node.type === 'element' ? node.tagName : parentTag);
    nextChildren.push(child);
  }
  node.children = nextChildren;
}

export default function termTooltips() {
  return (tree, file) => {
    const filePath = String(file?.path ?? file?.history?.[0] ?? '');
    if (!TARGET_POST.test(filePath) && !SERIES_MARKER.test(treeText(tree))) return;
    walk(tree);
  };
}
