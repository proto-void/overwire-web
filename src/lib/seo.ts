import { siteConfig } from '../../site.config';

/** Absolute https://overwire.protovoid.com/... URL (canonical host from site.config). */
export function absoluteUrl(path = '/') {
  const base = siteConfig.url.replace(/\/$/, '');
  if (!path || path === '/') return `${base}/`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (/\.[a-z0-9]+$/i.test(normalized)) {
    return `${base}${normalized}`;
  }
  const withSlash = normalized.endsWith('/') ? normalized : `${normalized}/`;
  return `${base}${withSlash}`;
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.studioName,
      url: siteConfig.studioUrl,
    },
    inLanguage: 'en',
  };
}

export function softwareApplicationLd() {
  const app: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'BrowserApplication',
    applicationSubCategory: 'DeveloperApplication',
    operatingSystem: 'Chrome, Edge, Firefox',
    url: siteConfig.url,
    description: siteConfig.description,
    image: absoluteUrl(siteConfig.defaultOgImage),
    codeRepository: siteConfig.github,
    license: 'https://opensource.org/licenses/MIT',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.studioName,
      url: siteConfig.studioUrl,
    },
  };

  if (siteConfig.chromeStoreUrl) {
    app.downloadUrl = siteConfig.chromeStoreUrl;
  }

  return app;
}

export function faqPageLd(faqs: readonly { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
