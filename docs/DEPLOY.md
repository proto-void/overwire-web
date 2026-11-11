# Deploy Overwire product site

Worker script name remains **`detour-web`** until a later Worker rename. Content and canonical URLs are Overwire.

## Live host truth (2026-11-11)

**Single product host:** Worker **`detour-web`** serves:

- **`https://overwire.protovoid.com/`** (canonical SEO host)
- plus **`https://detour-web.hamza-khan-669.workers.dev/`**

**`detour.protovoid.com` is taken down** (2026-11-11). It is **not** attached to `detour-web`, has **no** zone DNS record, and must **not** 301/302 to Overwire. Authoritative DNS returns **NXDOMAIN**. Do **not** deploy `workers/detour-to-overwire-redirect/` (git template only; keep undeployed).

**Post take-down probe (maintainer machine, 2026-11-11, proxy cleared):**

| Check | Result |
|-------|--------|
| Worker domains | `overwire.protovoid.com` → **`detour-web`** only; **no** `detour.protovoid.com` binding |
| Zone DNS `detour.protovoid.com` | **none** (managed AAAA removed with custom domain detach) |
| Auth `dig` A/AAAA `detour.protovoid.com` `@jasper.ns.cloudflare.com` | **NXDOMAIN** |
| Public `dig` `@8.8.8.8` `detour.protovoid.com` | **NXDOMAIN** |
| `curl -sI https://overwire.protovoid.com/` | **HTTP/2 200**, Overwire HTML (`og:title` Overwire, canonical overwire host) |
| `curl -sI https://detour.protovoid.com/` | No site content; **no** `Location` redirect. Resolvers with stale cache may briefly see Cloudflare **522**; after TTL → connection / resolve failure |

A premature Cloudflare Worker **`detour-to-overwire-redirect`** was **deleted** earlier (2026-11-10). Hamza later chose **take-down without redirect** instead of a 301 cutover.

## One-shot (after Cloudflare auth)

```sh
cd ~/Project/overwire-web
npm install
npm run deploy
```

`wrangler.jsonc` deploys Worker **`detour-web`** with assets from `./dist` and custom domain **`overwire.protovoid.com` only**. Do not re-add `detour.protovoid.com` to `routes`.

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

If the Worker is live but `overwire.protovoid.com` is not:

1. Dashboard → **Workers & Pages** → **detour-web** → **Settings** → **Domains & Routes**
2. Ensure **`overwire.protovoid.com`** is on **`detour-web`**
3. Or via API: `PUT /accounts/{account_id}/workers/domains` with `{ hostname: "overwire.protovoid.com", service: "detour-web", zone_id }`

No separate Pages project is required; this is an assets Worker.

## Legacy hostname (do not revive)

- **Do not** re-attach `detour.protovoid.com` to `detour-web`.
- **Do not** deploy `workers/detour-to-overwire-redirect/` (no 301/302 path forward).
- If the hostname appears again, detach the Worker domain and delete any zone DNS for `detour.protovoid.com`.

## Blocked elsewhere (not this deploy)

- GitHub rename done: `proto-void/overwire` + `proto-void/overwire-web` (old names redirect)
- Local folder rename **DONE** (`docs/ops/local-folder-rename.md`); open `overwire.code-workspace`
- CWS listing title/copy to Overwire
