import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, it, expect } from 'vitest';
import worker from '../src';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const PROJECT_ID = 'grogro-jello-4a53a';

const toBase64Url = (input) =>
	btoa(input)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '');

const jsonToBase64Url = (value) => toBase64Url(JSON.stringify(value));

const bytesToBase64Url = (bytes) => {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return toBase64Url(binary);
};

const toHex = (bytes) => Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');

const createXsollaSignature = async (body, secret) => {
	const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(`${body}${secret}`));
	return toHex(new Uint8Array(digest));
};

const signJwt = async (privateKey, kid, payload) => {
	const header = { alg: 'RS256', typ: 'JWT', kid };
	const encodedHeader = jsonToBase64Url(header);
	const encodedPayload = jsonToBase64Url(payload);
	const signingInput = `${encodedHeader}.${encodedPayload}`;
	const signature = await crypto.subtle.sign(
		{ name: 'RSASSA-PKCS1-v1_5' },
		privateKey,
		new TextEncoder().encode(signingInput)
	);
	return `${signingInput}.${bytesToBase64Url(new Uint8Array(signature))}`;
};

const withMockedJwks = async (publicJwk, fn) => {
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async (input, init) => {
		const url = typeof input === 'string' ? input : input?.url;
		if (url === JWKS_URL) {
			return new Response(
				JSON.stringify({ keys: [publicJwk] }),
				{ status: 200, headers: { 'cache-control': 'public, max-age=3600' } }
			);
		}
		return originalFetch(input, init);
	};

	try {
		return await fn();
	} finally {
		globalThis.fetch = originalFetch;
	}
};

describe('Worker auth gate', () => {
	let privateKey;
	let publicJwk;
	const userId = 'test-user-123';

	beforeAll(async () => {
		const keyPair = await crypto.subtle.generateKey(
			{
				name: 'RSASSA-PKCS1-v1_5',
				modulusLength: 2048,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: 'SHA-256',
			},
			true,
			['sign', 'verify']
		);

		privateKey = keyPair.privateKey;
		publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
		publicJwk.kid = 'test-kid-1';
		publicJwk.alg = 'RS256';
		publicJwk.use = 'sig';
	});

	beforeEach(async () => {
		await env.DB.prepare('DROP TABLE IF EXISTS xsolla_webhook_events').run();
		await env.DB.prepare('DROP TABLE IF EXISTS users').run();
		await env.DB.prepare('DROP TABLE IF EXISTS daily_routine_claims').run();
		await env.DB.prepare('DROP TABLE IF EXISTS api_rate_limits').run();
		await env.DB.prepare(`
			CREATE TABLE users (
				uid TEXT PRIMARY KEY,
				email TEXT,
				display_name TEXT,
				level INTEGER DEFAULT 1,
				xp INTEGER DEFAULT 0,
				gro INTEGER DEFAULT 0,
				star INTEGER DEFAULT 0,
				current_land TEXT DEFAULT 'default_ground',
				inventory TEXT DEFAULT '[]',
				game_data TEXT,
				created_at INTEGER,
				last_synced_at INTEGER,
				is_premium INTEGER DEFAULT 0,
				subscription_end INTEGER DEFAULT 0,
				subscription_plan TEXT,
				xsolla_subscription_id INTEGER,
				xsolla_transaction_id INTEGER
			)
		`).run();
		await env.DB.prepare(`
			CREATE TABLE daily_routine_claims (
				uid TEXT NOT NULL,
				date_key TEXT NOT NULL,
				claimed_at INTEGER NOT NULL,
				PRIMARY KEY (uid, date_key)
			)
		`).run();
		await env.DB.prepare(`
			CREATE TABLE api_rate_limits (
				key TEXT PRIMARY KEY,
				count INTEGER NOT NULL DEFAULT 0,
				window_start INTEGER NOT NULL,
				last_seen INTEGER NOT NULL,
				blocked_until INTEGER NOT NULL DEFAULT 0
			)
		`).run();
		await env.DB.prepare(`
			CREATE TABLE xsolla_webhook_events (
				event_key TEXT PRIMARY KEY,
				notification_type TEXT NOT NULL,
				uid TEXT,
				product_id TEXT,
				xsolla_transaction_id INTEGER,
				xsolla_subscription_id INTEGER,
				processing_status TEXT NOT NULL DEFAULT 'processing',
				processed_at INTEGER NOT NULL
			)
		`).run();
	});

	it('returns 401 when Authorization header is missing', async () => {
		const request = new Request(`http://example.com/api/users/${userId}`);
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(401);
		const body = await response.json();
		expect(body.error).toContain('Authorization');
	});

	it('returns 403 when token sub and path uid do not match', async () => {
		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: 'another-user',
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		await withMockedJwks(publicJwk, async () => {
			const request = new Request(`http://example.com/api/users/${userId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(403);
			const body = await response.json();
			expect(body.error).toContain('UID mismatch');
		});
	});

	it('requires auth for xsolla checkout token endpoint', async () => {
		const request = new Request(`http://example.com/api/users/${userId}/xsolla/checkout-token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ productId: 'subscription_12_months' }),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(401);
	});

	it('returns 503 for xsolla checkout token endpoint when xsolla config is incomplete', async () => {
		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		await withMockedJwks(publicJwk, async () => {
			const request = new Request(`http://example.com/api/users/${userId}/xsolla/checkout-token`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ productId: 'subscription_12_months' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(503);
			const body = await response.json();
			expect(body.error).toContain('Xsolla base configuration incomplete');
		});
	});

	it('uses production checkout base url when XSOLLA_ENV=production', async () => {
		env.XSOLLA_ENV = 'production';
		env.XSOLLA_MERCHANT_ID = 'merchant-1';
		env.XSOLLA_PROJECT_ID = 'project-1';
		env.XSOLLA_API_KEY = 'api-key-1';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID = 'plan-prod-12';

		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		const originalFetch = globalThis.fetch;
		globalThis.fetch = async (input, init) => {
			const url = typeof input === 'string' ? input : input?.url;
			if (url === JWKS_URL) {
				return new Response(
					JSON.stringify({ keys: [publicJwk] }),
					{ status: 200, headers: { 'cache-control': 'public, max-age=3600' } }
				);
			}

			if (url === 'https://api.xsolla.com/merchant/v2/merchants/merchant-1/token') {
				const payload = JSON.parse(init.body);
				expect(payload.settings.mode).toBe('live');
				return new Response(JSON.stringify({ token: 'prod-token-123', order_id: 'order-prod-1' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return originalFetch(input, init);
		};

		try {
			const request = new Request(`http://example.com/api/users/${userId}/xsolla/checkout-token`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ productId: 'subscription_12_months' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.sandbox).toBe(false);
			expect(body.checkoutUrl).toBe('https://secure.xsolla.com/paystation4/?token=prod-token-123');
		} finally {
			globalThis.fetch = originalFetch;
			delete env.XSOLLA_ENV;
			delete env.XSOLLA_MERCHANT_ID;
			delete env.XSOLLA_PROJECT_ID;
			delete env.XSOLLA_API_KEY;
			delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID;
		}
	});

	it('uses the allowed request origin as the xsolla return url when XSOLLA_RETURN_URL is unset', async () => {
		env.XSOLLA_MERCHANT_ID = 'merchant-1';
		env.XSOLLA_PROJECT_ID = 'project-1';
		env.XSOLLA_API_KEY = 'api-key-1';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID = 'plan-sandbox-12';

		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		const originalFetch = globalThis.fetch;
		globalThis.fetch = async (input, init) => {
			const url = typeof input === 'string' ? input : input?.url;
			if (url === JWKS_URL) {
				return new Response(
					JSON.stringify({ keys: [publicJwk] }),
					{ status: 200, headers: { 'cache-control': 'public, max-age=3600' } }
				);
			}

			if (url === 'https://api.xsolla.com/merchant/v2/merchants/merchant-1/token') {
				const payload = JSON.parse(init.body);
				expect(payload.settings.return_url).toBe('http://localhost:5173/profile?tab=pass');
				return new Response(JSON.stringify({ token: 'sandbox-token-123', order_id: 'order-sandbox-1' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return originalFetch(input, init);
		};

		try {
			const request = new Request(`http://example.com/api/users/${userId}/xsolla/checkout-token`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					Origin: 'http://localhost:5173',
				},
				body: JSON.stringify({ productId: 'subscription_12_months' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.checkoutUrl).toBe('https://sandbox-secure.xsolla.com/paystation4/?token=sandbox-token-123');
		} finally {
			globalThis.fetch = originalFetch;
			delete env.XSOLLA_MERCHANT_ID;
			delete env.XSOLLA_PROJECT_ID;
			delete env.XSOLLA_API_KEY;
			delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID;
		}
	});

	it('returns 503 for xsolla webhook endpoint when webhook secret is missing', async () => {
		const request = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			body: JSON.stringify({ event: 'payment' }),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(503);
		const body = await response.json();
		expect(body.error).toContain('Xsolla webhook secret not configured');
	});

	it('rejects xsolla webhook requests with invalid signature', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		const request = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			headers: {
				authorization: 'Signature deadbeef',
			},
			body: JSON.stringify({ notification_type: 'user_validation', user: { id: userId } }),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(401);
		const body = await response.json();
		expect(body.error).toBe('INVALID_SIGNATURE');
		delete env.XSOLLA_WEBHOOK_SECRET;
	});

	it('accepts signed xsolla user_validation webhook', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		const rawBody = JSON.stringify({ notification_type: 'user_validation', user: { id: userId } });
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);
		const request = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			headers: {
				authorization: `Signature ${signature}`,
			},
			body: rawBody,
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(204);
		delete env.XSOLLA_WEBHOOK_SECRET;
	});

	it('grants subscription access on create_subscription webhook', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID = 'WZ401Sj5';
		const rawBody = JSON.stringify({
			notification_type: 'create_subscription',
			user: { id: userId },
			subscription: {
				plan_id: 'WZ401Sj5',
				subscription_id: 551122,
				date_next_charge: '2026-07-24T00:00:00+00:00',
			},
		});
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);
		const request = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			headers: {
				authorization: `Signature ${signature}`,
			},
			body: rawBody,
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(204);
		const stored = await env.DB.prepare(
			'SELECT is_premium, subscription_plan, subscription_end, xsolla_subscription_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.is_premium).toBe(1);
		expect(stored.subscription_plan).toBe('subscription_3_months');
		expect(stored.subscription_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.xsolla_subscription_id).toBe(551122);
		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID;
	});

	it('ignores duplicate create_subscription webhook deliveries', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID = 'WZ401Sj5';
		const rawBody = JSON.stringify({
			notification_type: 'create_subscription',
			user: { id: userId },
			subscription: {
				plan_id: 'WZ401Sj5',
				subscription_id: 551122,
				date_next_charge: '2026-07-24T00:00:00+00:00',
			},
		});
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);

		for (let attempt = 0; attempt < 2; attempt += 1) {
			const request = new Request('http://example.com/api/xsolla/webhook', {
				method: 'POST',
				headers: {
					authorization: `Signature ${signature}`,
				},
				body: rawBody,
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(204);
		}

		const stored = await env.DB.prepare(
			'SELECT subscription_end, xsolla_subscription_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.subscription_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.xsolla_subscription_id).toBe(551122);

		const events = await env.DB.prepare(
			'SELECT notification_type, product_id, processing_status FROM xsolla_webhook_events WHERE xsolla_subscription_id = ?'
		).bind(551122).all();
		expect(events.results).toHaveLength(1);
		expect(events.results[0].notification_type).toBe('create_subscription');
		expect(events.results[0].product_id).toBe('subscription_3_months');
		expect(events.results[0].processing_status).toBe('processed');

		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID;
	});

	it('applies update_subscription webhook once for the same renewal window', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID = 'plan-prod-12';
		const rawBody = JSON.stringify({
			notification_type: 'update_subscription',
			user: { id: userId },
			subscription: {
				plan_id: 'plan-prod-12',
				subscription_id: 991122,
				date_next_charge: '2027-07-24T00:00:00+00:00',
			},
		});
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);

		for (let attempt = 0; attempt < 2; attempt += 1) {
			const request = new Request('http://example.com/api/xsolla/webhook', {
				method: 'POST',
				headers: {
					authorization: `Signature ${signature}`,
				},
				body: rawBody,
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(204);
		}

		const stored = await env.DB.prepare(
			'SELECT is_premium, subscription_plan, subscription_end, xsolla_subscription_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.is_premium).toBe(1);
		expect(stored.subscription_plan).toBe('subscription_12_months');
		expect(stored.subscription_end).toBe(Date.parse('2027-07-24T00:00:00+00:00'));
		expect(stored.xsolla_subscription_id).toBe(991122);

		const events = await env.DB.prepare(
			'SELECT notification_type, product_id, processing_status FROM xsolla_webhook_events WHERE xsolla_subscription_id = ?'
		).bind(991122).all();
		expect(events.results).toHaveLength(1);
		expect(events.results[0].notification_type).toBe('update_subscription');
		expect(events.results[0].product_id).toBe('subscription_12_months');
		expect(events.results[0].processing_status).toBe('processed');

		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID;
	});

	it('grants one-time duration access on order_paid webhook', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration_3_months';
		const paymentDate = '2026-04-24T00:00:00+00:00';
		const rawBody = JSON.stringify({
			notification_type: 'order_paid',
			user: { id: userId },
			order: { invoice_id: 2002806344 },
			transaction: { payment_date: paymentDate },
			items: [{ sku: 'duration_3_months' }],
		});
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);
		const request = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			headers: {
				authorization: `Signature ${signature}`,
			},
			body: rawBody,
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(204);
		const stored = await env.DB.prepare(
			'SELECT is_premium, subscription_plan, subscription_end, xsolla_transaction_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.is_premium).toBe(1);
		expect(stored.subscription_plan).toBe('duration_3_months');
		expect(stored.subscription_end).toBe(Date.parse('2026-07-24T00:00:00.000Z'));
		expect(stored.xsolla_transaction_id).toBe(2002806344);
		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_DURATION_3_MONTHS_SKU;
	});

	it('ignores duplicate order_paid webhook deliveries', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration_3_months';
		const paymentDate = '2026-04-24T00:00:00+00:00';
		const rawBody = JSON.stringify({
			notification_type: 'order_paid',
			user: { id: userId },
			order: { invoice_id: 2002806344 },
			transaction: { payment_date: paymentDate },
			items: [{ sku: 'duration_3_months' }],
		});
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);

		for (let attempt = 0; attempt < 2; attempt += 1) {
			const request = new Request('http://example.com/api/xsolla/webhook', {
				method: 'POST',
				headers: {
					authorization: `Signature ${signature}`,
				},
				body: rawBody,
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(204);
		}

		const stored = await env.DB.prepare(
			'SELECT subscription_end, xsolla_transaction_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.subscription_end).toBe(Date.parse('2026-07-24T00:00:00.000Z'));
		expect(stored.xsolla_transaction_id).toBe(2002806344);

		const events = await env.DB.prepare(
			'SELECT notification_type, product_id, processing_status FROM xsolla_webhook_events WHERE xsolla_transaction_id = ?'
		).bind(2002806344).all();
		expect(events.results).toHaveLength(1);
		expect(events.results[0].notification_type).toBe('order_paid');
		expect(events.results[0].product_id).toBe('duration_3_months');
		expect(events.results[0].processing_status).toBe('processed');

		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_DURATION_3_MONTHS_SKU;
	});

	it('keeps recurring subscription premium active on non_renewal_subscription webhook', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID = 'plan-prod-12';
		const rawBody = JSON.stringify({
			notification_type: 'non_renewal_subscription',
			user: { id: userId },
			subscription: {
				plan_id: 'plan-prod-12',
				subscription_id: 991122,
				date_end: '2026-07-24T00:00:00+00:00',
			},
		});
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);
		const request = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			headers: {
				authorization: `Signature ${signature}`,
			},
			body: rawBody,
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(204);
		const stored = await env.DB.prepare(
			'SELECT is_premium, subscription_plan, subscription_end, xsolla_subscription_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.is_premium).toBe(1);
		expect(stored.subscription_plan).toBe('subscription_12_months');
		expect(stored.subscription_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.xsolla_subscription_id).toBe(991122);
		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID;
	});

	it('ignores duplicate non_renewal_subscription webhook deliveries', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID = 'plan-prod-12';
		const rawBody = JSON.stringify({
			notification_type: 'non_renewal_subscription',
			user: { id: userId },
			subscription: {
				plan_id: 'plan-prod-12',
				subscription_id: 991122,
				date_end: '2026-07-24T00:00:00+00:00',
			},
		});
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);

		for (let attempt = 0; attempt < 2; attempt += 1) {
			const request = new Request('http://example.com/api/xsolla/webhook', {
				method: 'POST',
				headers: {
					authorization: `Signature ${signature}`,
				},
				body: rawBody,
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(204);
		}

		const stored = await env.DB.prepare(
			'SELECT is_premium, subscription_plan, subscription_end, xsolla_subscription_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.is_premium).toBe(1);
		expect(stored.subscription_plan).toBe('subscription_12_months');
		expect(stored.subscription_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.xsolla_subscription_id).toBe(991122);

		const events = await env.DB.prepare(
			'SELECT notification_type, product_id, processing_status FROM xsolla_webhook_events WHERE xsolla_subscription_id = ?'
		).bind(991122).all();
		expect(events.results).toHaveLength(1);
		expect(events.results[0].notification_type).toBe('non_renewal_subscription');
		expect(events.results[0].product_id).toBe('subscription_12_months');
		expect(events.results[0].processing_status).toBe('processed');

		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID;
	});

	it('ignores duplicate cancel_subscription webhook deliveries', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID = 'plan-prod-12';
		const rawBody = JSON.stringify({
			notification_type: 'cancel_subscription',
			user: { id: userId },
			subscription: {
				plan_id: 'plan-prod-12',
				subscription_id: 991122,
				date_end: '2026-07-24T00:00:00+00:00',
			},
		});
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);

		for (let attempt = 0; attempt < 2; attempt += 1) {
			const request = new Request('http://example.com/api/xsolla/webhook', {
				method: 'POST',
				headers: {
					authorization: `Signature ${signature}`,
				},
				body: rawBody,
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(204);
		}

		const stored = await env.DB.prepare(
			'SELECT is_premium, subscription_plan, subscription_end, xsolla_subscription_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.is_premium).toBe(1);
		expect(stored.subscription_plan).toBe('subscription_12_months');
		expect(stored.subscription_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.xsolla_subscription_id).toBe(991122);

		const events = await env.DB.prepare(
			'SELECT notification_type, product_id, processing_status FROM xsolla_webhook_events WHERE xsolla_subscription_id = ?'
		).bind(991122).all();
		expect(events.results).toHaveLength(1);
		expect(events.results[0].notification_type).toBe('cancel_subscription');
		expect(events.results[0].product_id).toBe('subscription_12_months');
		expect(events.results[0].processing_status).toBe('processed');

		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID;
	});

	it('ignores duplicate refund webhook deliveries', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, is_premium, subscription_end, subscription_plan, xsolla_transaction_id, created_at, last_synced_at)
			VALUES (?, 1, ?, 'duration_3_months', 2002806344, ?, ?)
		`).bind(userId, nowMs + (30 * 24 * 60 * 60 * 1000), nowMs, nowMs).run();

		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration_3_months';
		const rawBody = JSON.stringify({
			notification_type: 'refund',
			user: { id: userId },
			order: { invoice_id: 2002806344 },
			items: [{ sku: 'duration_3_months' }],
		});
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET);

		for (let attempt = 0; attempt < 2; attempt += 1) {
			const request = new Request('http://example.com/api/xsolla/webhook', {
				method: 'POST',
				headers: {
					authorization: `Signature ${signature}`,
				},
				body: rawBody,
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(204);
		}

		const stored = await env.DB.prepare(
			'SELECT is_premium, subscription_end, subscription_plan, xsolla_transaction_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.is_premium).toBe(0);
		expect(stored.subscription_end).toBe(0);
		expect(stored.subscription_plan).toBeNull();
		expect(stored.xsolla_transaction_id).toBeNull();

		const events = await env.DB.prepare(
			'SELECT notification_type, product_id, processing_status FROM xsolla_webhook_events WHERE xsolla_transaction_id = ?'
		).bind(2002806344).all();
		expect(events.results).toHaveLength(1);
		expect(events.results[0].notification_type).toBe('refund');
		expect(events.results[0].product_id).toBe('duration_3_months');
		expect(events.results[0].processing_status).toBe('processed');

		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_DURATION_3_MONTHS_SKU;
	});

	it('allows GET when token is valid and uid matches', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, email, display_name, level, xp, gro, star, current_land, inventory, game_data, created_at, last_synced_at, is_premium, subscription_end, subscription_plan)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			userId,
			'test@example.com',
			'Tester',
			2,
			100,
			50,
			10,
			'default_ground',
			JSON.stringify([]),
			JSON.stringify({ hasCharacter: true }),
			nowMs,
			nowMs,
			0,
			0,
			null
		).run();

		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		await withMockedJwks(publicJwk, async () => {
			const request = new Request(`http://example.com/api/users/${userId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.found).toBe(true);
			expect(body.data.uid).toBe(userId);
		});
	});

	it('rate limits repeated authenticated GET requests for the same user', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, email, display_name, level, xp, gro, star, current_land, inventory, game_data, created_at, last_synced_at, is_premium, subscription_end, subscription_plan)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			userId,
			'test@example.com',
			'Tester',
			2,
			100,
			50,
			10,
			'default_ground',
			JSON.stringify([]),
			JSON.stringify({ hasCharacter: true }),
			nowMs,
			nowMs,
			0,
			0,
			null
		).run();

		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		await withMockedJwks(publicJwk, async () => {
			let lastResponse;
			for (let i = 0; i < 7; i++) {
				const request = new Request(`http://example.com/api/users/${userId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
						'CF-Connecting-IP': '203.0.113.10',
					},
				});
				const ctx = createExecutionContext();
				lastResponse = await worker.fetch(request, env, ctx);
				await waitOnExecutionContext(ctx);
			}

			expect(lastResponse.status).toBe(429);
			expect(lastResponse.headers.get('Retry-After')).toBeTruthy();
			const body = await lastResponse.json();
			expect(body.reason).toBe('user_rate_limit');
		});
	});

	it('applies cooldown to repeated sync writes', async () => {
		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		const payload = {
			email: 'test@example.com',
			display_name: 'Tester',
			level: 1,
			xp: 0,
			gro: 0,
			star: 0,
			current_land: 'default_ground',
			inventory: [],
			game_data: JSON.stringify({ hasCharacter: false }),
			created_at: Date.now(),
		};

		await withMockedJwks(publicJwk, async () => {
			const firstRequest = new Request(`http://example.com/api/users/${userId}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					'CF-Connecting-IP': '203.0.113.11',
				},
				body: JSON.stringify(payload),
			});
			const firstCtx = createExecutionContext();
			const firstResponse = await worker.fetch(firstRequest, env, firstCtx);
			await waitOnExecutionContext(firstCtx);
			expect(firstResponse.status).toBe(200);

			const secondRequest = new Request(`http://example.com/api/users/${userId}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					'CF-Connecting-IP': '203.0.113.11',
				},
				body: JSON.stringify(payload),
			});
			const secondCtx = createExecutionContext();
			const secondResponse = await worker.fetch(secondRequest, env, secondCtx);
			await waitOnExecutionContext(secondCtx);

			expect(secondResponse.status).toBe(429);
			const body = await secondResponse.json();
			expect(body.reason).toBe('action_cooldown');
		});
	});

	it('rejects abnormal star jumps during sync', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, email, display_name, level, xp, gro, star, current_land, inventory, game_data, created_at, last_synced_at, is_premium, subscription_end, subscription_plan)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			userId,
			'test@example.com',
			'Tester',
			2,
			100,
			50,
			10,
			'default_ground',
			JSON.stringify(['apple']),
			JSON.stringify({
				xp: 100,
				gro: 50,
				totalGameStars: 10,
				evolutionStage: 2,
				currentLand: 'default_ground',
				inventory: ['apple'],
			}),
			nowMs,
			nowMs,
			0,
			0,
			null
		).run();

		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		const payload = {
			email: 'test@example.com',
			display_name: 'Tester',
			level: 2,
			xp: 120,
			gro: 70,
			star: 80,
			current_land: 'default_ground',
			inventory: ['apple'],
			game_data: JSON.stringify({
				xp: 120,
				gro: 70,
				totalGameStars: 80,
				evolutionStage: 2,
				currentLand: 'default_ground',
				inventory: ['apple'],
			}),
			created_at: nowMs,
		};

		await withMockedJwks(publicJwk, async () => {
			const request = new Request(`http://example.com/api/users/${userId}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					'CF-Connecting-IP': '203.0.113.22',
				},
				body: JSON.stringify(payload),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.error).toContain('Abnormal star gain');
		});
	});

	it('blocks repeated authentication failures from the same IP and uid', async () => {
		const requestFactory = () => new Request(`http://example.com/api/users/${userId}`, {
			headers: {
				Authorization: 'Bearer invalid.token.value',
				'CF-Connecting-IP': '203.0.113.12',
			},
		});

		let lastResponse;
		for (let i = 0; i < 6; i++) {
			const ctx = createExecutionContext();
			lastResponse = await worker.fetch(requestFactory(), env, ctx);
			await waitOnExecutionContext(ctx);
		}

		expect(lastResponse.status).toBe(429);
		const body = await lastResponse.json();
		expect(body.reason).toBe('auth_failure_limit');
	});

	it('returns the matching allowed origin in CORS headers', async () => {
		const request = new Request(`http://example.com/api/users/${userId}`, {
			method: 'OPTIONS',
			headers: {
				Origin: 'https://grogrojello.com',
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://grogrojello.com');
		expect(response.headers.get('Vary')).toContain('Origin');
	});

	it('rejects unsupported methods before auth', async () => {
		const request = new Request(`http://example.com/api/users/${userId}`, {
			method: 'DELETE',
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(405);
		expect(response.headers.get('Allow')).toBe('GET, POST, OPTIONS');
	});

	it('rejects non-json post bodies before auth', async () => {
		const request = new Request(`http://example.com/api/users/${userId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain',
			},
			body: 'bad body',
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(415);
	});

	it('allows private-network Vite dev origins in CORS headers', async () => {
		const request = new Request(`http://example.com/api/users/${userId}`, {
			method: 'OPTIONS',
			headers: {
				Origin: 'http://172.30.1.91:5174',
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://172.30.1.91:5174');
	});

	it('allows the current public Vite dev origin in CORS headers', async () => {
		const request = new Request(`http://example.com/api/users/${userId}`, {
			method: 'OPTIONS',
			headers: {
				Origin: 'http://175.214.49.200:5173',
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://175.214.49.200:5173');
	});

	it('allows the current public Vite preview origin in CORS headers', async () => {
		const request = new Request(`http://example.com/api/users/${userId}`, {
			method: 'OPTIONS',
			headers: {
				Origin: 'http://175.214.49.200:4173',
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://175.214.49.200:4173');
	});

	it('omits Access-Control-Allow-Origin for disallowed origins', async () => {
		const request = new Request(`http://example.com/api/users/${userId}`, {
			method: 'OPTIONS',
			headers: {
				Origin: 'https://evil.example.com',
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
		expect(response.headers.get('Vary')).toContain('Origin');
	});

	it('forwards recurring subscription cancellation to xsolla', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, is_premium, subscription_end, subscription_plan, xsolla_subscription_id, created_at, last_synced_at)
			VALUES (?, 1, ?, 'subscription_12_months', 991122, ?, ?)
		`).bind(userId, nowMs + (30 * 24 * 60 * 60 * 1000), nowMs, nowMs).run();
		env.XSOLLA_MERCHANT_ID = 'merchant-1';
		env.XSOLLA_PROJECT_ID = '303877';
		env.XSOLLA_API_KEY = 'api-key-1';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID = 'plan-prod-12';

		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		const originalFetch = globalThis.fetch;
		globalThis.fetch = async (input, init) => {
			const url = typeof input === 'string' ? input : input?.url;
			if (url === JWKS_URL) {
				return new Response(
					JSON.stringify({ keys: [publicJwk] }),
					{ status: 200, headers: { 'cache-control': 'public, max-age=3600' } }
				);
			}

			if (url === `https://api.xsolla.com/merchant/v2/projects/303877/users/${userId}/subscriptions/991122`) {
				const payload = JSON.parse(init.body);
				expect(payload.status).toBe('non_renewing');
				return new Response(JSON.stringify({ id: 991122, status: 'non_renewing' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return originalFetch(input, init);
		};

		try {
			const request = new Request(`http://example.com/api/users/${userId}/cancel`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.mode).toBe('xsolla');
			expect(body.subscriptionId).toBe(991122);
			expect(body.status).toBe('non_renewing');
		} finally {
			globalThis.fetch = originalFetch;
			delete env.XSOLLA_MERCHANT_ID;
			delete env.XSOLLA_PROJECT_ID;
			delete env.XSOLLA_API_KEY;
			delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID;
		}

		const row = await env.DB.prepare('SELECT is_premium, subscription_end, subscription_plan FROM users WHERE uid = ?')
			.bind(userId)
			.first();
		expect(row).toBeTruthy();
		expect(row.is_premium).toBe(1);
		expect(row.subscription_plan).toBe('subscription_12_months');
	});

	it('returns 409 for duration pass cancellation until refund flow is enabled', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, email, is_premium, subscription_end, subscription_plan, xsolla_transaction_id, created_at, last_synced_at)
			VALUES (?, 'test@example.com', 1, ?, 'duration_3_months', 2002806344, ?, ?)
		`).bind(userId, nowMs + (30 * 24 * 60 * 60 * 1000), nowMs, nowMs).run();

		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});
		await withMockedJwks(publicJwk, async () => {
			const request = new Request(`http://example.com/api/users/${userId}/cancel`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(409);
			const body = await response.json();
			expect(body.error).toContain('refunds are not enabled');
			expect(body.subscriptionPlan).toBe('duration_3_months');
		});

		const row = await env.DB.prepare(
			'SELECT is_premium, subscription_end, subscription_plan, xsolla_transaction_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(row).toBeTruthy();
		expect(row.is_premium).toBe(1);
		expect(row.subscription_end).toBeGreaterThan(nowMs);
		expect(row.subscription_plan).toBe('duration_3_months');
		expect(row.xsolla_transaction_id).toBe(2002806344);
	});

	it('returns 409 when recurring xsolla subscription id is missing locally', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, is_premium, subscription_end, subscription_plan, created_at, last_synced_at)
			VALUES (?, 1, ?, 'subscription_12_months', ?, ?)
		`).bind(userId, nowMs + (30 * 24 * 60 * 60 * 1000), nowMs, nowMs).run();
		env.XSOLLA_MERCHANT_ID = 'merchant-1';
		env.XSOLLA_PROJECT_ID = '303877';
		env.XSOLLA_API_KEY = 'api-key-1';

		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		await withMockedJwks(publicJwk, async () => {
			const request = new Request(`http://example.com/api/users/${userId}/cancel`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(409);
			const body = await response.json();
			expect(body.error).toContain('Xsolla subscription tracking is missing');
			expect(body.subscriptionPlan).toBe('subscription_12_months');
		});

		delete env.XSOLLA_MERCHANT_ID;
		delete env.XSOLLA_PROJECT_ID;
		delete env.XSOLLA_API_KEY;
	});

	it('claims daily routine reward once per date and updates xp/gro', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, email, display_name, level, xp, gro, star, current_land, inventory, game_data, created_at, last_synced_at, is_premium, subscription_end, subscription_plan)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			userId,
			'test@example.com',
			'Tester',
			3,
			100,
			50,
			10,
			'default_ground',
			JSON.stringify([]),
			JSON.stringify({ hasCharacter: true }),
			nowMs,
			nowMs,
			0,
			0,
			null
		).run();

		const now = Math.floor(Date.now() / 1000);
		const token = await signJwt(privateKey, publicJwk.kid, {
			iss: `https://securetoken.google.com/${PROJECT_ID}`,
			aud: PROJECT_ID,
			sub: userId,
			iat: now - 30,
			exp: now + 3600,
			auth_time: now - 30,
		});

		await withMockedJwks(publicJwk, async () => {
			const request = new Request(`http://example.com/api/users/${userId}/daily-routine-claim`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ dateKey: '2026-03-20' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.reward.gro).toBeGreaterThan(0);
			expect(body.reward.xp).toBeGreaterThan(0);
		});

		const updatedUser = await env.DB.prepare('SELECT xp, gro FROM users WHERE uid = ?')
			.bind(userId)
			.first();
		expect(updatedUser).toBeTruthy();
		expect(updatedUser.xp).toBeGreaterThan(100);
		expect(updatedUser.gro).toBeGreaterThan(50);

		const claimRow = await env.DB.prepare('SELECT uid, date_key FROM daily_routine_claims WHERE uid = ? AND date_key = ?')
			.bind(userId, '2026-03-20')
			.first();
		expect(claimRow).toBeTruthy();

		await withMockedJwks(publicJwk, async () => {
			const request = new Request(`http://example.com/api/users/${userId}/daily-routine-claim`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ dateKey: '2026-03-20' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(409);
			const body = await response.json();
			expect(body.alreadyClaimed).toBe(true);
		});
	});
});
