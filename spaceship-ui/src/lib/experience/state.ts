import { RESEARCH_AREAS } from '../taxonomy.mjs';

export type ExperienceRoute = 'home' | 'research' | 'other';
export type ExperienceTier = 'safe' | 'normal' | 'ultra';
export type RendererBackend = 'none' | 'webgl2' | 'webgpu';

export const RESEARCH_NODE_IDS = Object.freeze([...RESEARCH_AREAS]) as readonly string[];
export type ResearchNodeId = string | null;

export function isResearchNodeId(value: string): value is Exclude<ResearchNodeId, null> {
  return RESEARCH_NODE_IDS.includes(value);
}

export interface ExperiencePointer {
  x: number;
  y: number;
}

export interface ExperienceSnapshot {
  route: ExperienceRoute;
  scrollProgress: number;
  activeResearchNode: ResearchNodeId;
  pointer: ExperiencePointer;
  reducedMotion: boolean;
  tier: ExperienceTier;
  rendererBackend: RendererBackend;
  webgpuAvailable: boolean;
  fps: number;
}

type Listener = (snapshot: Readonly<ExperienceSnapshot>) => void;

const INITIAL_STATE: ExperienceSnapshot = {
  route: 'other',
  scrollProgress: 0,
  activeResearchNode: null,
  pointer: { x: 0, y: 0 },
  reducedMotion: false,
  tier: 'safe',
  rendererBackend: 'none',
  webgpuAvailable: false,
  fps: 0,
};

class ExperienceStore {
  private snapshot: ExperienceSnapshot = structuredClone(INITIAL_STATE);
  private listeners = new Set<Listener>();

  get(): Readonly<ExperienceSnapshot> {
    return this.snapshot;
  }

  patch(patch: Partial<ExperienceSnapshot>): void {
    this.snapshot = {
      ...this.snapshot,
      ...patch,
      pointer: patch.pointer ? { ...patch.pointer } : this.snapshot.pointer,
    };

    for (const listener of this.listeners) listener(this.snapshot);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('jjo:experience-state', {
          detail: this.snapshot,
        }),
      );
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  resetRenderer(): void {
    this.patch({
      pointer: { x: 0, y: 0 },
      rendererBackend: 'none',
      fps: 0,
    });
  }
}

export const experienceState = new ExperienceStore();

export function experienceRouteFromPath(pathname: string): ExperienceRoute {
  if (pathname === '/') return 'home';
  if (pathname === '/research' || pathname.startsWith('/research/')) return 'research';
  return 'other';
}
