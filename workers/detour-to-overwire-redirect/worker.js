/**
 * Ready-to-deploy 301 Worker: detour.protovoid.com → overwire.protovoid.com
 *
 * TEMPLATE ONLY — not live. A premature Cloudflare deploy was deleted (2026-11-10).
 *
 * Deploy ONLY when DNS is clean:
 *   - https://overwire.protovoid.com/ returns 200 via normal local resolve
 *     (no curl --resolve / hosts hacks)
 *   - dual-host detour-web is healthy and you intend detour to stop serving content
 *
 * Blind or early redirect breaks the live Detour hostname.
 * Cutover order: see ../../docs/DEPLOY.md and ./README.md
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'overwire.protovoid.com';
    return Response.redirect(url.toString(), 301);
  },
};
