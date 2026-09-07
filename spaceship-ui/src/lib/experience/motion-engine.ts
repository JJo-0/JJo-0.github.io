import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// This module is imported only when the viewport can use enhanced motion.
gsap.registerPlugin(ScrollTrigger);

export const motionEngine = { gsap, ScrollTrigger };
export type MotionEngine = typeof motionEngine;
