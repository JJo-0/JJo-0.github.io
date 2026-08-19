export interface ResearchFocus {
  id: string;
  title: string;
  label: string;
  description: string;
  question: string;
  methods: string[];
  status: 'Ongoing';
  tags: string[];
}

export const RESEARCH_FOCUS: ResearchFocus[] = [
  {
    id: 'robotics-systems',
    title: 'Robotics & Systems',
    label: 'Robotics',
    description: 'ROS2, 로봇 시스템, 제어와 학습 기반 로봇을 구현하며 실제 시스템 제약 속에서 검증한 기록입니다.',
    question: '로봇 시스템은 사람과 현실 환경의 제약 속에서 어떻게 더 신뢰성 있게 동작할 수 있을까?',
    methods: ['ROS2', 'Control', 'System Integration', 'Robot Learning'],
    status: 'Ongoing',
    tags: ['robotics', 'ros', 'ros2', 'reinforcement-learning', 'communication-protocols', 'ethercat'],
  },
  {
    id: 'vision-perception',
    title: 'Vision & Perception',
    label: 'Perception',
    description: 'Pose estimation, calibration, SLAM, deep learning 기반 시각 인지를 공부하고 불확실성을 포함해 검증한 기록입니다.',
    question: '로봇은 불확실한 관측에서 사람과 환경의 상태를 어떻게 더 정확하게 추정할 수 있을까?',
    methods: ['3D Vision', 'Pose Estimation', 'Calibration', 'State Estimation'],
    status: 'Ongoing',
    tags: ['computer-vision', 'pose-estimation', 'opencv', 'calibration', 'deep-learning', 'slam'],
  },
  {
    id: 'ai-research',
    title: 'AI & Research Notes',
    label: 'AI Research',
    description: 'AI 모델, 평가, 연구 방법과 deep research 과정을 재현 가능한 근거와 함께 구조화한 기술 노트입니다.',
    question: 'AI 시스템의 주장과 성능을 어떻게 재현 가능한 증거, 평가, 설명으로 연결할 수 있을까?',
    methods: ['Evaluation', 'Deep Research', 'Interpretability', 'Research Engineering'],
    status: 'Ongoing',
    tags: ['artificial-intelligence', 'ai-research', 'research-paper', 'research-analysis', 'deep-research', 'machine-learning'],
  },
];
