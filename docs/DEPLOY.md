# Deploy Overwire product site

Worker script name remains **`detour-web`** until the GitHub/repo rename stream lands (`overwire-web`). Content and canonical URLs are Overwire.

## Live host truth (2026-11-10)

**Dual-host:** Worker **`detour-web`** serves **both**:

- **`https://overwire.protovoid.com/`** (canonical SEO host)
- **`https://detour.protovoid.com/`** (legacy host, still 200 Overwire content)
- plus **`https://detour-web.hamza-khan-669.workers.dev/`**

There is **no** live 301 from detour → overwire. Redirect Worker **`detour-to-overwire-redirect`** is **not** present in Cloudflare (template only in git).

**DNS gate probe (maintainer machine, 2026-11-10, Last verified, no `--resolve`):**

| Check | Result |
|-------|--------|
| `dig` A `overwire.protovoid.com` | `104.21.67.50`, `172.67.213.209` |
| `dig` AAAA `overwire` / `detour` | Cloudflare anycast (`2606:4700:…`) |
| Cloudflare zone DNS | Both hostnames: proxied AAAA `100::` (Worker custom domain, read-only) |
| Worker domains | Both → service **`detour-web`** (enabled) |
| `curl -sI https://overwire.protovoid.com/` + `/support/` | **HTTP/2 200**, Overwire HTML (`og:title` Overwire, canonical overwire host) |
| `curl -sI https://detour.protovoid.com/` + `/support/` | **HTTP/2 200**, same Overwire content |
| Earlier false 403 | Local HTTPS proxy `CONNECT` block (`https_proxy=127.0.0.1`); not edge. Re-probe with proxy cleared. |

**Gate status:** public DNS + HTTPS 200 Overwire content are **clean**. **301 cutover still deferred on purpose** (keep dual-host until Hamza chooses to move `detour.protovoid.com` onto the redirect Worker). Do not deploy `detour-to-overwire-redirect` as a casual follow-up; cutover is deliberate.

A premature Cloudflare Worker **`detour-to-overwire-redirect`** was **deleted** earlier the same day after it broke the live detour host while public resolve of overwire was still flaky. The git template under `workers/detour-to-overwire-redirect/` remains for a later cutover.

## One-shot (after Cloudflare auth)

```sh
cd ~/Project/overwire-web
npm install
npm run deploy
```

`wrangler.jsonc` deploys Worker **`detour-web`** with assets from `./dist`. Keep **both** custom domains attached to **`detour-web`** for the dual-host period (do not point `detour.protovoid.com` at the redirect template yet).

## Auth

If deploy fails with a missing token:

```sh
npx wrangler login
# or export CLOUDFLARE_API_TOKEN=<token with Workers + zone edit on protovoid.com>
npm run deploy
```

Use the Cloudflare account that owns the **protovoid.com** zone.

## DNS / custom domain

When `custom_domain: true` succeeds, Cloudflare attaches the hostname automatically (AAAA `100::` + Worker domain).

If the Worker is live but a hostname is not:

1. Dashboard → **Workers & Pages** → **detour-web** → **Settings** → **Domains & Routes**
2. Ensure **both** `overwire.protovoid.com` and `detour.protovoid.com` are on **`detour-web`** (dual-host)
3. Or via API: `PUT /accounts/{account_id}/workers/domains` with `{ hostname, service: "detour-web", zone_id }`

No separate Pages project is required; this is an assets Worker.

## Domain cutover (301) — template only until Hamza cuts over

**DNS cleanliness (2026-11-10):** satisfied (see probe table above). Remaining gate is **human intent** to leave dual-host.

Deploy the redirect Worker **only when**:

1. **`https://overwire.protovoid.com/`** still returns 200 with Overwire content on **normal local resolve** (no `--resolve` / hosts-file hacks).
2. Sitemap / robots / OG look good on that same resolve path.
3. You are ready for `detour.protovoid.com` to stop serving content and only redirect (today it stays healthy on **`detour-web`**).

Then (and only then):

```sh
cd ~/Project/overwire-web/workers/detour-to-overwire-redirect
npx wrangler deploy
```

That Worker returns `301` to `https://overwire.protovoid.com` preserving path + query, and takes ownership of `detour.protovoid.com`.

**Do not** attach the redirect Worker to `detour.protovoid.com` while overwire DNS is missing, flaky, or only reachable via `--resolve` — that takes down the live product site (already happened once; Worker was deleted).

After a successful 301 is live, Search Console can migrate the property to `https://overwire.protovoid.com/`.

## Blocked elsewhere (not this deploy)

- ~~Clean local DNS for `overwire.protovoid.com`~~ **cleared 2026-11-10** (see gate probe above); 301 still **human-deferred**
- GitHub rename done: `proto-void/overwire` + `proto-void/overwire-web` (old names redirect)
- Local folder rename **DONE** (`docs/ops/local-folder-rename.md`); open `overwire.code-workspace`
- CWS listing title/copy to Overwire
