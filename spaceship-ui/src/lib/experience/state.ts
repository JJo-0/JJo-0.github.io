export type ExperienceTier = 'safe' | 'normal' | 'ultra';

export interface ExperienceSnapshot {
  route: string;
  scrollProgress: number;
  activeResearchNode: string | null;
  reducedMotion: boolean;
  tier: ExperienceTier;
}

type Listener = (snapshot: Readonly<ExperienceSnapshot>) => void;

const state: ExperienceSnapshot = {
  route: '/',
  scrollProgress: 0,
  activeResearchNode: null,
  reducedMotion: false,
  tier: 'normal',
};

const listeners = new Set<Listener>();

function emit(): void {
  const snapshot = Object.freeze({ ...state });
  for (const listener of listeners) listener(snapshot);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('experience:change', { detail: snapshot }));
  }
}

export const experienceState = {
  get(): Readonly<ExperienceSnapshot> {
    return Object.freeze({ ...state });
  },

  set(patch: Partial<ExperienceSnapshot>): void {
    Object.assign(state, patch);
    emit();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(Object.freeze({ ...state }));
    return () => listeners.delete(listener);
  },
};
