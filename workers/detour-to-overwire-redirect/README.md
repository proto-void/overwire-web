# detour → overwire 301 (obsolete template)

Git template that would 301 `detour.protovoid.com` → `overwire.protovoid.com`. **Do not deploy.**

## Live status (2026-11-11)

Hamza chose a **take-down without redirect**. `detour.protovoid.com` is detached from Worker **`detour-web`**, zone DNS is gone, and authoritative DNS is **NXDOMAIN**. Canonical product host is **`https://overwire.protovoid.com/`** only.

A premature production deploy of this Worker was **deleted** on 2026-11-10. Keep this directory as historical reference only.

## Do not deploy

```sh
# Do NOT run:
# cd ~/Project/overwire-web/workers/detour-to-overwire-redirect
# npx wrangler deploy
```

Host truth and deploy notes: [`../../docs/DEPLOY.md`](../../docs/DEPLOY.md).
