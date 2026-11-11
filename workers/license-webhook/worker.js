/**
 * Overwire license issuance — Stripe webhook Worker.
 *
 * Spec: overwire monorepo AI/specs/licensing.md (Approved).
 * ADR-032: offline Ed25519 OWPRO keys; zero Overwire-hosted license DB.
 *
 * DO NOT deploy with real secrets committed to git.
 * Set secrets via `wrangler secret put` (see README.md).
 *
 * Expected secrets / bindings (names only — values never in repo):
 *   STRIPE_WEBHOOK_SECRET
 *   STRIPE_SECRET_KEY             (sk_test… for sandbox; sk_live… only for Phase B)
 *   LICENSE_ED25519_PRIVATE_KEY   (PKCS8 base64 / base64url — never commit)
 *   LICENSE_MAIL_API_KEY          (Resend / Postmark / etc. — optional)
 *
 * Vars (non-secret, wrangler.jsonc):
 *   LICENSE_MAIL_FROM
 *   LICENSE_KEY_PREFIX            (default OWPRO)
 *   SANDBOX_ECHO_LICENSE          ("1" only on sandbox Worker — echo key in JSON)
 */

const encoder = new TextEncoder();

/**
 * @param {string} s
 * @returns {Uint8Array}
 */
function base64UrlDecode(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function base64UrlEncode(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Minimal Stripe-Signature check (v1).
 * @param {string} payload
 * @param {string | null} header
 * @param {string} secret
 * @param {number} [toleranceSec]
 */
async function verifyStripeSignature(payload, header, secret, toleranceSec = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k.trim(), v];
    }),
  );
  const ts = parts.t;
  const v1 = parts.v1;
  if (!ts || !v1) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(ts));
  if (!Number.isFinite(age) || age > toleranceSec) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${ts}.${payload}`));
  const expected = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (expected.length !== v1.length) return false;
  let ok = 0;
  for (let i = 0; i < expected.length; i++) ok |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return ok === 0;
}

/**
 * Map Stripe price / product metadata → tier claims.
 * Fill real price IDs in Worker vars or Stripe Dashboard metadata when going live.
 * @param {Record<string, unknown>} session
 */
function claimsFromCheckoutSession(session) {
  const meta = /** @type {Record<string, string>} */ (session.metadata || {});
  const tier = (meta.overwire_tier || meta.tier || 'pro').toLowerCase();
  const seats = meta.seats ? Number(meta.seats) : undefined;
  const now = Math.floor(Date.now() / 1000);
  /** @type {Record<string, unknown>} */
  const claims = {
    tier: tier === 'team' || tier === 'enterprise' ? 'team' : 'pro',
    iat: now,
    sub: typeof session.customer === 'string' ? session.customer : undefined,
  };
  if (Number.isFinite(seats) && seats > 0) claims.seats = seats;
  if (meta.exp_days) {
    const days = Number(meta.exp_days);
    if (Number.isFinite(days) && days > 0) claims.exp = now + days * 86400;
  }
  return claims;
}

/**
 * Sign OWPRO.<payload>.<sig> with Ed25519.
 * Private key material must be provided as PKCS8 SPKI-compatible import for SubtleCrypto.
 * @param {Record<string, unknown>} claims
 * @param {string} pkcs8Base64
 * @param {string} prefix
 */
async function signLicense(claims, pkcs8Base64, prefix) {
  const payload = base64UrlEncode(encoder.encode(JSON.stringify(claims)));
  const pkcs8 = base64UrlDecode(pkcs8Base64.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''));
  const key = await crypto.subtle.importKey('pkcs8', pkcs8, { name: 'Ed25519' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('Ed25519', key, encoder.encode(payload)));
  return `${prefix}.${payload}.${base64UrlEncode(sig)}`;
}

/**
 * Best-effort Stripe Customer metadata update (zero app DB).
 * @param {string} customerId
 * @param {string} licenseKey
 * @param {string} stripeSecret
 */
async function attachKeyToCustomer(customerId, licenseKey, stripeSecret) {
  if (!customerId || !stripeSecret) return;
  const body = new URLSearchParams();
  body.set('metadata[overwire_license_key]', licenseKey);
  const res = await fetch(`https://api.stripe.com/v1/customers/${encodeURIComponent(customerId)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe customer update ${res.status}: ${text.slice(0, 200)}`);
  }
}

/**
 * Placeholder mail send — wire to Resend/Postmark using LICENSE_MAIL_API_KEY.
 * @param {{ to: string, licenseKey: string, from: string, apiKey: string }} opts
 */
async function emailLicense(opts) {
  if (!opts.to || !opts.apiKey) {
    console.log('[license-webhook] skip email (missing to or LICENSE_MAIL_API_KEY)');
    return;
  }
  // Replace with your provider’s HTTP API. No provider SDK in this template.
  console.log('[license-webhook] email stub', {
    from: opts.from,
    to: opts.to,
    keyPrefix: opts.licenseKey.slice(0, 12) + '…',
  });
}

export default {
  /**
   * @param {Request} request
   * @param {Record<string, string>} env
   */
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({
        ok: true,
        service: 'overwire-license-webhook',
        sandbox: env.SANDBOX_ECHO_LICENSE === '1',
      });
    }

    if (request.method !== 'POST' || url.pathname !== '/stripe/webhook') {
      return new Response('Not found', { status: 404 });
    }

    const payload = await request.text();
    const ok = await verifyStripeSignature(
      payload,
      request.headers.get('stripe-signature'),
      env.STRIPE_WEBHOOK_SECRET || '',
    );
    if (!ok) return new Response('Invalid signature', { status: 400 });

    /** @type {{ type?: string, data?: { object?: Record<string, unknown> } }} */
    let event;
    try {
      event = JSON.parse(payload);
    } catch {
      return new Response('Bad JSON', { status: 400 });
    }

    // checkout.session.completed is the primary issuance path for Payment Links.
    if (event.type !== 'checkout.session.completed') {
      return Response.json({ received: true, ignored: event.type });
    }

    const session = event.data?.object || {};
    if (session.payment_status && session.payment_status !== 'paid') {
      return Response.json({ received: true, skipped: 'unpaid' });
    }

    if (!env.LICENSE_ED25519_PRIVATE_KEY) {
      console.error('[license-webhook] LICENSE_ED25519_PRIVATE_KEY not set');
      return new Response('Server misconfigured', { status: 500 });
    }

    const prefix = env.LICENSE_KEY_PREFIX || 'OWPRO';
    const claims = claimsFromCheckoutSession(session);
    let licenseKey;
    try {
      licenseKey = await signLicense(claims, env.LICENSE_ED25519_PRIVATE_KEY, prefix);
    } catch (err) {
      console.error('[license-webhook] sign failed', err);
      return new Response('Sign failed', { status: 500 });
    }

    const customerId = typeof session.customer === 'string' ? session.customer : '';
    let attached = false;
    if (customerId && env.STRIPE_SECRET_KEY) {
      try {
        await attachKeyToCustomer(customerId, licenseKey, env.STRIPE_SECRET_KEY);
        attached = true;
      } catch (err) {
        console.error('[license-webhook] attach failed', err);
      }
    } else if (!env.STRIPE_SECRET_KEY) {
      console.warn('[license-webhook] STRIPE_SECRET_KEY missing — skipped customer metadata attach');
    }

    const email =
      (typeof session.customer_details === 'object' &&
        session.customer_details &&
        /** @type {{ email?: string }} */ (session.customer_details).email) ||
      (typeof session.customer_email === 'string' ? session.customer_email : '');

    await emailLicense({
      to: email || '',
      licenseKey,
      from: env.LICENSE_MAIL_FROM || 'overwire@protovoid.com',
      apiKey: env.LICENSE_MAIL_API_KEY || '',
    });

    /** @type {Record<string, unknown>} */
    const body = { received: true, issued: true, tier: claims.tier, attached };
    // Sandbox E2E only — never enable SANDBOX_ECHO_LICENSE on a live Worker.
    if (env.SANDBOX_ECHO_LICENSE === '1') {
      body.licenseKey = licenseKey;
    }
    return Response.json(body);
  },
};
