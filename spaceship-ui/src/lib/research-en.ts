import { RESEARCH_FOCUS as original } from './research';
const descriptions: Record<string, string> = {
  'robotics-autonomous-systems': 'Implementation and validation notes on ROS2, SLAM, real-world robot learning, industrial communication, and autonomous systems.',
  'vision-pose-human-perception': 'Research connecting 3D human pose, motion forecasting, camera geometry, and human vision.',
  'ml-foundations-evaluation': 'Notes linking mathematics, probability, and optimization to generalization, evaluation metrics, and industrial data analysis.',
  'ai-consciousness-governance': 'Research on AI consciousness, mechanistic interpretability, AI welfare, and governance under uncertainty.',
};
export const RESEARCH_FOCUS = original.map((focus) => ({ ...focus, description: descriptions[focus.id] || focus.description }));
