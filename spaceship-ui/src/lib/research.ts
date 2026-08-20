import { RESEARCH_AREAS, RESEARCH_AREA_META } from './taxonomy.mjs';

export interface ResearchFocus {
  id: string;
  title: string;
  label: string;
  description: string;
}

type ResearchAreaId = keyof typeof RESEARCH_AREA_META;

export const RESEARCH_FOCUS: ResearchFocus[] = (
  RESEARCH_AREAS as readonly ResearchAreaId[]
).map((id) => {
  const meta = RESEARCH_AREA_META[id];
  return {
    id,
    title: meta.title,
    label: meta.label,
    description: meta.description,
  };
});
