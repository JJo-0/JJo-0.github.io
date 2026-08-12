export interface SiteConfig {
  author: string;
  desc: string;
  title: string;
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
  desc: 'My study note',
  title: "Don't Worry, Be Happy 😛",
  ogImage: 'about_photo.jpg',
  lang: 'ko-KR',
  base: '/',
  website: 'https://jjo-0.github.io',
  social: {
    github: 'https://github.com/JJo-0',
    instagram: 'https://www.instagram.com/jo___09/',
    website: 'https://blog.naver.com/jjo_09_',
  },
  googleAnalyticsId: 'G-JL4J2492X6',
  googleSiteVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  naverSiteVerification: import.meta.env.PUBLIC_NAVER_SITE_VERIFICATION || '',
  bingSiteVerification: import.meta.env.PUBLIC_BING_SITE_VERIFICATION || '',
  adsense: {
    enabled: true,
    clientId: 'ca-pub-7495843758830919',
    adSlot: '',
  },
  homeHeroDescription: '개발과 연구, 그리고 공부 기록을 쌓아가는 개인 기술 블로그입니다.',
  blogDescription: '개발, AI, 로보틱스, 헬스케어 관련 글을 정리합니다.',
  projectsDescription: '진행했던 프로젝트와 실험 기록입니다.',
  featuredPostsCount: 3,
  latestPostsCount: 3,
  homeProjects: {
    enabled: true,
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
