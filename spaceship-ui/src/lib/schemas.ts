import { SITE } from '@/config';

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.title,
    description: SITE.desc,
    url: SITE.website,
    author: {
      '@type': 'Person',
      name: SITE.author,
    },
    inLanguage: SITE.lang,
  };
}

export function getBlogPostingSchema(data: {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  url: string;
  canonicalURL?: string;
  lang?: string;
  image?: string;
  tags?: string[];
}) {
  const effectiveUrl = data.canonicalURL || data.url;
  const modifiedDate = data.updatedDate || data.pubDate;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    datePublished: data.pubDate.toISOString(),
    dateModified: modifiedDate.toISOString(),
    author: {
      '@type': 'Person',
      name: SITE.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.title,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE.website}/${SITE.ogImage}`,
      },
    },
    mainEntityOfPage: effectiveUrl,
    url: effectiveUrl,
    image: data.image,
    keywords: data.tags?.join(', '),
    inLanguage: data.lang || SITE.lang,
  };
}

export function getCollectionPageSchema(data: {
  name: string;
  description: string;
  url: string;
  items: {
    name: string;
    url: string;
    datePublished?: Date;
  }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.name,
    description: data.description,
    url: data.url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.title,
      url: SITE.website,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: data.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        item: {
          '@type': item.datePublished ? 'BlogPosting' : 'Thing',
          name: item.name,
          url: item.url,
          ...(item.datePublished ? { datePublished: item.datePublished.toISOString() } : {}),
        },
      })),
    },
  };
}

export function getPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.author,
    url: SITE.website,
    sameAs: Object.values(SITE.social),
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.title,
    url: SITE.website,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE.website}/${SITE.ogImage}`,
    },
    sameAs: Object.values(SITE.social),
  };
}
