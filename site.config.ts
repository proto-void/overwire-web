export const siteConfig = {
  name: 'Overwire',
  tagline: 'Point production at your code.',
  /** SEO document title (~50–60 chars). */
  title: 'Overwire · Redirect, API Tester & Databases in Chrome',
  description:
    'Redirect and override production in Chrome, plus a local API Tester and Databases workbench — MIT open source, no Overwire server.',
  /** Canonical product host (ADR-031 / plan 041). Served by Worker `detour-web`. */
  url: 'https://overwire.protovoid.com',
  /** Legacy host — currently dual-host 200 on `detour-web`; 301 template only (deploy when DNS clean). */
  legacyUrl: 'https://detour.protovoid.com',
  themeColor: '#07060d',
  defaultOgImage: '/brand/og-default.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  /** Target repo rename (ADR-031 / plan 041). GitHub redirects until rename lands. */
  github: 'https://github.com/proto-void/overwire',
  /** Set when the Chrome Web Store listing is live. Empty = show “Chrome soon” CTA; omit downloadUrl in JSON-LD. */
  chromeStoreUrl: 'https://chromewebstore.google.com/detail/detour/jfgbokgdgpjhkciooicmbdgablgkklmn',
  contactEmail: 'overwire@protovoid.com',
  studioUrl: 'https://protovoid.com',
  studioName: 'Protovoid',
  /**
   * Stripe Payment Links for #pricing CTAs.
   * Leave empty until Checkout links exist — UI shows “Coming soon” instead of inventing secrets.
   */
  paymentLinks: {
    proOneTime: '',
    proYearly: '',
    teamSeat: '',
    teamSite: '',
  },
} as const;
