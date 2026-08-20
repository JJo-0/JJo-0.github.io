export const POST_CATEGORIES = Object.freeze([
  'ai-machine-learning',
  'vision-perception-neuroscience',
  'robotics-embedded',
  'software-engineering-cs',
  'research-methods-tools',
  'health-lifestyle',
  'finance-industry',
  'meta',
]);

export const POST_CATEGORY_META = Object.freeze({
  'ai-machine-learning': {
    label: 'AI & Machine Learning',
    shortLabel: 'AI / ML',
    description:
      '머신러닝 기초, 수학, 평가, 산업 AI, AI 의식·해석 가능성 연구를 정리합니다.',
  },
  'vision-perception-neuroscience': {
    label: 'Vision, Perception & Neuroscience',
    shortLabel: 'Vision',
    description:
      '컴퓨터 비전, 인간 자세·동작, 카메라 기하, 시각 신경과학을 연결합니다.',
  },
  'robotics-embedded': {
    label: 'Robotics & Embedded Systems',
    shortLabel: 'Robotics',
    description:
      'ROS2, SLAM, 로봇 학습, 산업 통신, 임베디드 시스템 구현 기록입니다.',
  },
  'software-engineering-cs': {
    label: 'Software Engineering & CS',
    shortLabel: 'Software',
    description:
      '프로그래밍, 자료구조·알고리즘, 웹, Linux·Docker 개발환경을 다룹니다.',
  },
  'research-methods-tools': {
    label: 'Research Methods & AI Tools',
    shortLabel: 'Research Tools',
    description:
      'Deep Research, 프롬프트 설계, 검증 가능한 조사 워크플로를 정리합니다.',
  },
  'health-lifestyle': {
    label: 'Health & Lifestyle',
    shortLabel: 'Health',
    description:
      '영양, 건강관리, 보충제, 생활·소비자 가이드를 근거 중심으로 정리합니다.',
  },
  'finance-industry': {
    label: 'Finance & Industry',
    shortLabel: 'Finance',
    description:
      '기업, 산업 구조, 에너지·원자재 시장과 투자 분석을 다룹니다.',
  },
  meta: {
    label: 'Site Meta',
    shortLabel: 'Meta',
    description: '블로그 운영과 기록 방식 자체에 관한 글입니다.',
  },
});

export const POST_TYPES = Object.freeze([
  'study-note',
  'tutorial',
  'setup-guide',
  'implementation',
  'paper-review',
  'research-report',
  'interactive-guide',
  'buying-guide',
  'financial-analysis',
  'essay',
  'meta',
]);

export const POST_TYPE_LABELS = Object.freeze({
  'study-note': 'Study Note',
  tutorial: 'Tutorial',
  'setup-guide': 'Setup Guide',
  implementation: 'Implementation',
  'paper-review': 'Paper Review',
  'research-report': 'Research Report',
  'interactive-guide': 'Interactive Guide',
  'buying-guide': 'Buying Guide',
  'financial-analysis': 'Financial Analysis',
  essay: 'Essay',
  meta: 'Meta',
});

export const RESEARCH_AREAS = Object.freeze([
  'robotics-autonomous-systems',
  'vision-pose-human-perception',
  'ml-foundations-evaluation',
  'ai-consciousness-governance',
]);

export const RESEARCH_AREA_META = Object.freeze({
  'robotics-autonomous-systems': {
    title: 'Robotics & Autonomous Systems',
    label: 'Robotics',
    description:
      'ROS2, SLAM, 실세계 로봇학습, 산업 통신과 자율 시스템 구현·검증 기록입니다.',
  },
  'vision-pose-human-perception': {
    title: 'Vision, Pose & Human Perception',
    label: 'Perception',
    description:
      '3D human pose, motion forecasting, camera geometry와 인간 시각을 연결한 연구입니다.',
  },
  'ml-foundations-evaluation': {
    title: 'ML Foundations & Evaluation',
    label: 'ML Research',
    description:
      '수학·확률·최적화에서 일반화, 평가 지표, 산업 데이터 분석까지 이어지는 기록입니다.',
  },
  'ai-consciousness-governance': {
    title: 'AI Consciousness & Governance',
    label: 'AI Governance',
    description:
      'AI 의식, 기계적 해석 가능성, AI welfare와 불확실성 아래 거버넌스를 조사합니다.',
  },
});

export function getPostCategoryMeta(category) {
  return (
    POST_CATEGORY_META[category] ?? {
      label: category,
      shortLabel: category,
      description: '',
    }
  );
}

export function getPostTypeLabel(type) {
  return POST_TYPE_LABELS[type] ?? type;
}
