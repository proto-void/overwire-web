# overwire-license-webhook (template)

Stateless Stripe → Ed25519 `OWPRO.<payload>.<sig>` issuer for Overwire Pro/Team (ADR-032).

**Spec:** `AI/specs/licensing.md` is **Approved** (2026-11-10). This Worker remains an env-placeholder scaffold (no secrets in git). Extension verifies offline with the **public** key only (`LICENSE_VERIFY_PUBLIC_KEY` at build). MIT core stays ungated.

## What it does

1. `POST /stripe/webhook` — verify `Stripe-Signature`.
2. On `checkout.session.completed` (paid) — build claims, sign with `LICENSE_ED25519_PRIVATE_KEY`.
3. Write key to Stripe Customer `metadata.overwire_license_key` (zero Overwire DB).
4. Email stub (wire Resend/Postmark with `LICENSE_MAIL_API_KEY`).

`GET /health` — liveness JSON (`template: true`).

## Secrets (never commit values)

```bash
cd workers/license-webhook
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put LICENSE_ED25519_PRIVATE_KEY   # PKCS8 base64 (no PEM armor required)
npx wrangler secret put LICENSE_MAIL_API_KEY
```

Non-secret vars in `wrangler.jsonc`: `LICENSE_MAIL_FROM`, `LICENSE_KEY_PREFIX` (`OWPRO`).

## Deploy

Only when Hamza asks **and** Stripe Payment Links + webhook endpoint are ready. After deploy, bake the matching **public** SPKI into extension builds via `LICENSE_VERIFY_PUBLIC_KEY` (never the private key).

```bash
npx wrangler deploy
# Point Stripe webhook to https://<worker>/stripe/webhook
# events: checkout.session.completed
```

## Leave alone

CWS publish, repo/folder rename, SiteHeader — sibling streams. Do not commit private signing material.
