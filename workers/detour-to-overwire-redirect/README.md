# detour → overwire 301 (template only)

Git template for a Cloudflare Worker that 301s `detour.protovoid.com` → `overwire.protovoid.com` (path + query preserved).

## Live status

**Not deployed.** A premature production deploy was **deleted** from Cloudflare (2026-11-10) after it 301’d the live detour host while overwire public DNS was still flaky. Product traffic stays on dual-host Worker **`detour-web`** (both hostnames return 200). Cloudflare confirms no `detour-to-overwire-redirect` script; both custom domains still attach to **`detour-web`**.

**Last verified (2026-11-10, post–CWS Submit):** DNS gate still **clean** without `--resolve` (`dig` A/AAAA + `curl` **HTTP/2 200** Overwire HTML on `overwire.protovoid.com` and `detour.protovoid.com`, including `/support/`). Earlier local **403** was a machine HTTPS proxy `CONNECT` failure, not Cloudflare. **301 still deferred** (explicit Hamza cutover ask only) even though CWS rebrand is in review.

## Deploy only when ready to leave dual-host

DNS cleanliness alone is no longer the blocker. **Do not** run `npx wrangler deploy` here until:

1. `https://overwire.protovoid.com/` still returns 200 Overwire content via **normal local DNS** (no `curl --resolve`, no hosts file) — currently true.
2. Support / sitemap / robots look good on that same resolve path.
3. You are ready for `detour.protovoid.com` to stop serving content and only redirect.

Cutover order and dual-host notes: [`../../docs/DEPLOY.md`](../../docs/DEPLOY.md).
