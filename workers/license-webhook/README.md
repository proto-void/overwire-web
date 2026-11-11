# overwire-license-webhook

Stateless Stripe → Ed25519 `OWPRO.<payload>.<sig>` issuer for Overwire Pro/Team (ADR-032).

**Spec:** `AI/specs/licensing.md` is **Approved** (2026-11-10). Extension verifies offline with the **public** key only (`LICENSE_VERIFY_PUBLIC_KEY` at build). MIT core stays ungated. **$0** Overwire user DB.

## What it does

1. `POST /stripe/webhook` — verify `Stripe-Signature`.
2. On `checkout.session.completed` (paid) — build claims from session metadata (`overwire_tier` / `exp_days` / `seats`), sign with `LICENSE_ED25519_PRIVATE_KEY`.
3. Write key to Stripe Customer `metadata.overwire_license_key` (zero Overwire DB) when `STRIPE_SECRET_KEY` is set.
4. Email stub (wire Resend/Postmark with `LICENSE_MAIL_API_KEY`).

`GET /health` — liveness JSON (`sandbox: true` when `SANDBOX_ECHO_LICENSE=1`).

## Sandbox vs live

| | Sandbox (Phase A) | Live (Phase B) |
|--|-------------------|----------------|
| Wrangler `name` | `overwire-license-webhook-sandbox` | `overwire-license-webhook` (separate) |
| Stripe keys | `sk_test…` + test webhook secret | `sk_live…` + live webhook secret |
| `SANDBOX_ECHO_LICENSE` | `"1"` (echoes `licenseKey` in JSON for E2E) | **omit / never `"1"`** |
| `site.config.ts` `paymentLinks` | **keep empty** (do not paste test plinks) | fill live Payment Link URLs only |

## Secrets (never commit values)

Local sandbox keypair path (document path only):

- `~/.config/overwire/license-sandbox/ed25519-private-pkcs8.b64` → `LICENSE_ED25519_PRIVATE_KEY`
- `~/.config/overwire/license-sandbox/ed25519-public-spki.b64url` → extension `LICENSE_VERIFY_PUBLIC_KEY`
- Optional: `~/.config/overwire/license-sandbox/stripe-test.env` with `STRIPE_SECRET_KEY=sk_test…` (Hamza drops this; never commit)

```bash
cd workers/license-webhook
# Prefer piping from the private file so the value never lands in shell history:
npx wrangler secret put LICENSE_ED25519_PRIVATE_KEY < ~/.config/overwire/license-sandbox/ed25519-private-pkcs8.b64
npx wrangler secret put STRIPE_WEBHOOK_SECRET   # paste whsec_… from Stripe test webhook create
npx wrangler secret put STRIPE_SECRET_KEY        # paste sk_test… (required for Worker→Customer metadata)
# optional:
npx wrangler secret put LICENSE_MAIL_API_KEY
```

Non-secret vars in `wrangler.jsonc`: `LICENSE_MAIL_FROM`, `LICENSE_KEY_PREFIX` (`OWPRO`), `SANDBOX_ECHO_LICENSE`.

## Deploy (sandbox)

```bash
cd workers/license-webhook
npx wrangler deploy
# Point Stripe TEST-mode webhook to https://overwire-license-webhook-sandbox.<account>.workers.dev/stripe/webhook
# events: checkout.session.completed
```

After sandbox deploy, bake the matching **public** SPKI into unpacked test builds via `LICENSE_VERIFY_PUBLIC_KEY` (never the private key; never bake sandbox keys into CWS zips intended for store).

## Leave alone

CWS re-upload, live `site.config.ts` paymentLinks, npm publish, 301 Worker, production private key in git.
