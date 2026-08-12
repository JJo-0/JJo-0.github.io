export interface SiteConfig {
  author: string;
  desc: string;
  title: string;
  seoTitle: string;
  ogImage: string;
  lang: string;
  base: string;
  website: string;
  social: Record<string, string>;
  googleAnalyticsId?: string;
  googleSiteVerification?: string;
  naverSiteVerification?: string;
  bingSiteVerification?: string;
  adsense?: {
    enabled: boolean;
    clientId: string;
    adSlot?: string;
  };
  homeHeroDescription: string;
  blogDescription: string;
  projectsDescription: string;
  featuredPostsCount: number;
  latestPostsCount: number;
  publicSections: {
    projects: boolean;
    appearances: boolean;
  };
  homeProjects: {
    enabled: boolean;
    count: number;
  };
  cta: {
    enabled: boolean;
    filePath: string;
  };
  hero: {
    enabled: boolean;
    filePath: string;
  };
  comments: {
    enabled: boolean;
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
    reactionsEnabled: boolean;
    emitMetadata: boolean;
    inputPosition: 'top' | 'bottom';
    theme: string;
    lang: string;
  };
}

export const SITE: SiteConfig = {
  author: 'Park JiHo',
  desc: 'AI·로보틱스·컴퓨터 비전·개발 연구와 학습 기록을 정리하는 Park JiHo의 기술 블로그입니다.',
  title: "Don't Worry, Be Happy 😛",
  seoTitle: 'Park JiHo | AI & Robotics Research Notes',
  ogImage: 'og.png',
  lang: 'ko-KR',
  base: '/',
  website: 'https://jjo-0.github.io',
  social: {
    github: 'https://github.com/JJo-0',
    instagram: 'https://www.instagram.com/jo___09/',
    website: 'https://blog.naver.com/jjo_09_',
  },
  googleAnalyticsId: import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID || 'G-JL4J2492X6',
  googleSiteVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  naverSiteVerification: import.meta.env.PUBLIC_NAVER_SITE_VERIFICATION || '',
  bingSiteVerification: import.meta.env.PUBLIC_BING_SITE_VERIFICATION || '',
  adsense: {
    enabled: true,
    clientId: 'ca-pub-7495843758830919',
    adSlot: '',
  },
  homeHeroDescription: '개발과 연구, 그리고 공부 기록을 쌓아가는 개인 기술 블로그입니다.',
  blogDescription: 'AI, 로보틱스, 컴퓨터 비전, 개발 및 연구 노트를 정리합니다.',
  projectsDescription: '공개 가능한 프로젝트와 실험 기록입니다.',
  featuredPostsCount: 3,
  latestPostsCount: 3,
  publicSections: {
    projects: false,
    appearances: false,
  },
  homeProjects: {
    enabled: false,
    count: 4,
  },
  cta: {
    enabled: true,
    filePath: 'site/cta.md',
  },
  hero: {
    enabled: true,
    filePath: 'site/hero.md',
  },
  comments: {
    enabled: false,
    repo: 'JJo-0/JJo-0.github.io',
    repoId: '',
    category: 'General',
    categoryId: '',
    mapping: 'pathname',
    reactionsEnabled: true,
    emitMetadata: false,
    inputPosition: 'bottom',
    theme: 'preferred_color_scheme',
    lang: 'ko',
  },
};
