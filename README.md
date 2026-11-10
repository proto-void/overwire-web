# detour-web (Overwire product site)

Product site for [Overwire](https://github.com/proto-void/overwire) — Astro static site on a Cloudflare Worker.

- Canonical: **https://overwire.protovoid.com**
- Legacy host: **https://detour.protovoid.com**
- Both are **dual-host 200** on Worker **`detour-web`** (+ workers.dev). No live 301 yet.

GitHub repo is **`proto-void/overwire-web`**. Worker / local package name may still say `detour-web` until a later cutover.

## Develop

```sh
npm install
npm run dev
```

## SEO

See [docs/SEO.md](docs/SEO.md) for Search Console and post–Chrome Web Store wiring (`chromeStoreUrl`).

## Deploy

Requires Cloudflare auth (`wrangler login` or `CLOUDFLARE_API_TOKEN`) on the Protovoid account that owns the `protovoid.com` zone.

```sh
npm run deploy
```

See [docs/DEPLOY.md](docs/DEPLOY.md) for dual-host attach and the **deferred** `detour` → `overwire` 301 cutover (deploy redirect template only when DNS is clean). Template: `workers/detour-to-overwire-redirect/`.

## Push to GitHub

```sh
cd ~/Project/overwire-web
git remote -v             # origin → https://github.com/proto-void/overwire-web.git
```

Use your **Protovoid** org account.
