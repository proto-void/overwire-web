# SEO ops (post-launch)

Implementable site SEO lives in the repo (`BaseLayout`, `site.config.ts`, `/vs-resource-override/`, `/#pricing`, OG image). These steps stay **manual** for Hamza after CWS approval and domain cutover.

## Redeploy (when Wrangler OAuth is expired)

```sh
cd ~/Project/overwire-web
npx wrangler login
npm run deploy
```

If `protovoid-web` product blurb should be live too:

```sh
cd ~/Project/protovoid-web
npx wrangler login   # same account if needed
npm run deploy
```

## Google Search Console

Prefer the canonical host once it serves content:

1. Add a property for `https://overwire.protovoid.com/` (URL-prefix or domain via DNS).
2. Submit sitemap: `https://overwire.protovoid.com/sitemap-index.xml`
3. Request indexing for `/`, `/#pricing` (as `/`), `/vs-resource-override/`, `/support/`
4. Optional: Rich Results Test for SoftwareApplication / FAQPage on the home URL

Dual-host period (no live 301): the same paths are also live on `https://detour.protovoid.com/`. Do not deploy the 301 Worker until overwire resolves cleanly without `--resolve` — see [DEPLOY.md](DEPLOY.md).

## After Chrome Web Store is Overwire-branded

1. `chromeStoreUrl` in [`site.config.ts`](../site.config.ts) already points at listing `jfgbokgdgpjhkciooicmbdgablgkklmn` (slug may still say `detour` until CWS rename).
2. Redeploy so Install CTA / JSON-LD stay in sync.
3. Paste listing copy from the extension repo `docs/distribution/store-listing.md` in the CWS dashboard when editing — do **not** automate CWS upload from this site.

## Sanity checks after deploy

- `https://detour.protovoid.com/` and `https://overwire.protovoid.com/` (both dual-host on `detour-web`) — title, H1, FAQ, `#pricing`, footer links
- `/changelog/`, `/privacy/`, `/support/`, `/vs-resource-override/`
- `/brand/og-default.png` (1200×630)
- `/sitemap-index.xml`, `/robots.txt`
