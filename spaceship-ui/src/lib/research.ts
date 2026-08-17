export interface ResearchFocus {
  id: string;
  title: string;
  label: string;
  description: string;
  tags: string[];
}

export const RESEARCH_FOCUS: ResearchFocus[] = [
  {
    id: 'robotics-systems',
    title: 'Robotics & Systems',
    label: 'Robotics',
    description: 'ROS2, 로봇 시스템, 제어와 학습 기반 로봇을 구현하며 정리한 기록입니다.',
    tags: ['robotics', 'ros', 'ros2', 'reinforcement-learning', 'communication-protocols', 'ethercat'],
  },
  {
    id: 'vision-perception',
    title: 'Vision & Perception',
    label: 'Perception',
    description: 'Pose estimation, calibration, SLAM, deep learning 기반 시각 인지를 공부하고 검증한 기록입니다.',
    tags: ['computer-vision', 'pose-estimation', 'opencv', 'calibration', 'deep-learning', 'slam'],
  },
  {
    id: 'ai-research',
    title: 'AI & Research Notes',
    label: 'AI Research',
    description: 'AI 모델, 평가, 연구 방법과 deep research 과정을 구조화한 기술 노트입니다.',
    tags: ['artificial-intelligence', 'ai-research', 'research-paper', 'research-analysis', 'deep-research', 'machine-learning'],
  },
];
