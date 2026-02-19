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
  };
  homeHeroDescription: string;
  blogDescription: string;
  projectsDescription: string;

  // Homepage post counts
  featuredPostsCount: number;
  latestPostsCount: number;

  // Homepage projects
  homeProjects: {
    enabled: boolean;
    count: number;
  };

  // CTA (Call-to-Action) block for blog posts
  cta: {
    enabled: boolean;
    filePath: string; // Path to markdown file with CTA content
  };

  // Homepage Hero block
  hero: {
    enabled: boolean;
    filePath: string;
  };

  // Giscus comments configuration
  comments: {
    enabled: boolean;
    repo: string; // e.g., 'username/repo'
    repoId: string;
    category: string;
    categoryId: string;
    mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
    reactionsEnabled: boolean;
    emitMetadata: boolean;
    inputPosition: 'top' | 'bottom';
    theme: string; // e.g., 'preferred_color_scheme', 'light', 'dark'
    lang: string;
  };
}

export const SITE: SiteConfig = {
  author: 'Park JiHo',
  desc: 'My study note',
  title: "Don't Worry, Be Happy 😛",
  ogImage: 'og.png',
  lang: 'ko-KR',
  base: '/',
  website: 'https://jjo-0.github.io',
  social: {
    github: 'https://github.com/JJo-0',
    instagram: 'https://www.instagram.com/park6______13/',
    website: 'https://blog.naver.com/jjo_09_',
  },
  googleAnalyticsId: 'G-JL4J2492X6',
  googleSiteVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  naverSiteVerification: import.meta.env.PUBLIC_NAVER_SITE_VERIFICATION || '',
  bingSiteVerification: import.meta.env.PUBLIC_BING_SITE_VERIFICATION || '',
  adsense: {
    enabled: true,
    clientId: 'ca-pub-7495843758830919',
  },
  homeHeroDescription:
    '개발과 연구, 그리고 공부 기록을 쌓아가는 개인 기술 블로그입니다.',
  blogDescription: '개발, AI, 로보틱스, 헬스케어 관련 글을 정리합니다.',
  projectsDescription: '진행했던 프로젝트와 실험 기록입니다.',

  // Homepage post counts
  featuredPostsCount: 3,
  latestPostsCount: 3,

  // Homepage projects
  homeProjects: {
    enabled: true,
    count: 4,
  },

  // CTA (Call-to-Action) block for blog posts
  cta: {
    enabled: true,
    filePath: 'site/cta.md',
  },

  hero: {
    enabled: true,
    filePath: 'site/hero.md',
  },

  // Giscus comments configuration
  // Get your configuration from https://giscus.app
  comments: {
    enabled: false, // Set to true after filling in the IDs below
    repo: 'alec-c4/spaceship', // Your GitHub repository
    repoId: '', // Get from https://giscus.app - enter repo above and copy the value
    category: 'General', // GitHub Discussions category name
    categoryId: '', // Get from https://giscus.app - select category and copy the value
    mapping: 'pathname',
    reactionsEnabled: true,
    emitMetadata: false,
    inputPosition: 'bottom',
    theme: 'preferred_color_scheme', // Automatically matches your site theme
    lang: 'en',
  },
};
