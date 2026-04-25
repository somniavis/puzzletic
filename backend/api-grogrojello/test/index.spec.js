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
				entitlement_status TEXT DEFAULT 'inactive',
				entitlement_kind TEXT,
				entitlement_plan TEXT,
				entitlement_end INTEGER DEFAULT 0,
				billing_provider TEXT,
				billing_reference_id TEXT,
				billing_reference_type TEXT
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

	it('prefers production-scoped xsolla credentials and plan mapping when XSOLLA_ENV=production', async () => {
		env.XSOLLA_ENV = 'production';
		env.XSOLLA_MERCHANT_ID = 'merchant-generic';
		env.XSOLLA_PROJECT_ID = 'project-generic';
		env.XSOLLA_API_KEY = 'api-key-generic';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID = 'plan-generic-12';
		env.XSOLLA_MERCHANT_ID_PRODUCTION = 'merchant-prod';
		env.XSOLLA_PROJECT_ID_PRODUCTION = '303877';
		env.XSOLLA_API_KEY_PRODUCTION = 'api-key-prod';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID_PRODUCTION = 'plan-prod-12';

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
				return new Response(JSON.stringify({ keys: [publicJwk] }), {
					status: 200,
					headers: { 'cache-control': 'public, max-age=3600' },
				});
			}

			if (url === 'https://api.xsolla.com/merchant/v2/merchants/merchant-prod/token') {
				const payload = JSON.parse(init.body);
				expect(payload.settings.project_id).toBe(303877);
				expect(payload.purchase.subscription.plan_id).toBe('plan-prod-12');
				expect(init.headers.Authorization).toBe(`Basic ${btoa('merchant-prod:api-key-prod')}`);
				return new Response(JSON.stringify({ token: 'prod-token-scoped', order_id: 'order-prod-scoped' }), {
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
			expect(body.checkoutUrl).toBe('https://secure.xsolla.com/paystation4/?token=prod-token-scoped');
		} finally {
			globalThis.fetch = originalFetch;
			delete env.XSOLLA_ENV;
			delete env.XSOLLA_MERCHANT_ID;
			delete env.XSOLLA_PROJECT_ID;
			delete env.XSOLLA_API_KEY;
			delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID;
			delete env.XSOLLA_MERCHANT_ID_PRODUCTION;
			delete env.XSOLLA_PROJECT_ID_PRODUCTION;
			delete env.XSOLLA_API_KEY_PRODUCTION;
			delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID_PRODUCTION;
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
				expect(payload.settings.return_url).toBe('http://localhost:5173/profile?tab=my_jello');
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

	it('uses stored user email and display name instead of client-supplied checkout metadata', async () => {
		env.XSOLLA_MERCHANT_ID = 'merchant-1';
		env.XSOLLA_PROJECT_ID = 'project-1';
		env.XSOLLA_API_KEY = 'api-key-1';
		env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID = 'plan-sandbox-12';

		await env.DB.prepare(`
			INSERT INTO users (uid, email, display_name, created_at, last_synced_at)
			VALUES (?, ?, ?, ?, ?)
		`).bind(userId, 'trusted@example.com', 'Trusted Name', Date.now(), Date.now()).run();

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
				expect(payload.user.email.value).toBe('trusted@example.com');
				expect(payload.user.name.value).toBe('Trusted Name');
				expect(payload.user.email.value).not.toBe('spoofed@example.com');
				expect(payload.user.name.value).not.toBe('Spoofed Name');
				return new Response(JSON.stringify({ token: 'sandbox-token-456', order_id: 'order-sandbox-2' }), {
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
				body: JSON.stringify({
					productId: 'subscription_12_months',
					email: 'spoofed@example.com',
					name: 'Spoofed Name',
				}),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.success).toBe(true);
		} finally {
			globalThis.fetch = originalFetch;
			delete env.XSOLLA_MERCHANT_ID;
			delete env.XSOLLA_PROJECT_ID;
			delete env.XSOLLA_API_KEY;
			delete env.XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID;
		}
	});

	it('rejects a subscription product when vi-VN should use duration products', async () => {
		env.XSOLLA_MERCHANT_ID = 'merchant-1';
		env.XSOLLA_PROJECT_ID = 'project-1';
		env.XSOLLA_API_KEY = 'api-key-1';
		env.XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID = 'plan-sandbox-3';

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
				body: JSON.stringify({
					productId: 'subscription_3_months',
					languageCode: 'vi-VN',
				}),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.expectedProductId).toBe('duration_3_months');
		});

		delete env.XSOLLA_MERCHANT_ID;
		delete env.XSOLLA_PROJECT_ID;
		delete env.XSOLLA_API_KEY;
		delete env.XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID;
	});

	it('allows a duration product when id-ID should use duration products', async () => {
		env.XSOLLA_MERCHANT_ID = 'merchant-1';
		env.XSOLLA_PROJECT_ID = 'project-1';
		env.XSOLLA_API_KEY = 'api-key-1';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration-3-sku';

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

			if (url === 'https://store.xsolla.com/api/v3/project/project-1/admin/payment/token') {
				const payload = JSON.parse(init.body);
				expect(payload.settings.language).toBe('id');
				expect(payload.purchase.items[0].sku).toBe('duration-3-sku');
				expect(payload.purchase.items[0].quantity).toBe(1);
				return new Response(JSON.stringify({ token: 'duration-token-123', order_id: 'duration-order-1' }), {
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
				body: JSON.stringify({
					productId: 'duration_3_months',
					languageCode: 'id-ID',
				}),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.productId).toBe('duration_3_months');
		} finally {
			globalThis.fetch = originalFetch;
			delete env.XSOLLA_MERCHANT_ID;
			delete env.XSOLLA_PROJECT_ID;
			delete env.XSOLLA_API_KEY;
			delete env.XSOLLA_DURATION_3_MONTHS_SKU;
		}
	});

	it('prefers sandbox-scoped duration sku mapping when XSOLLA_ENV=sandbox', async () => {
		env.XSOLLA_ENV = 'sandbox';
		env.XSOLLA_MERCHANT_ID = 'merchant-generic';
		env.XSOLLA_PROJECT_ID = 'project-generic';
		env.XSOLLA_API_KEY = 'api-key-generic';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration-generic-sku';
		env.XSOLLA_MERCHANT_ID_SANDBOX = 'merchant-sandbox';
		env.XSOLLA_PROJECT_ID_SANDBOX = 'project-sandbox';
		env.XSOLLA_API_KEY_SANDBOX = 'api-key-sandbox';
		env.XSOLLA_DURATION_3_MONTHS_SKU_SANDBOX = 'duration-sandbox-sku';

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
				return new Response(JSON.stringify({ keys: [publicJwk] }), {
					status: 200,
					headers: { 'cache-control': 'public, max-age=3600' },
				});
			}

			if (url === 'https://store.xsolla.com/api/v3/project/project-sandbox/admin/payment/token') {
				const payload = JSON.parse(init.body);
				expect(payload.purchase.items[0].sku).toBe('duration-sandbox-sku');
				expect(init.headers.Authorization).toBe(`Basic ${btoa('project-sandbox:api-key-sandbox')}`);
				return new Response(JSON.stringify({ token: 'sandbox-token-scoped', order_id: 'sandbox-order-scoped' }), {
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
				body: JSON.stringify({
					productId: 'duration_3_months',
					languageCode: 'id-ID',
				}),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.checkoutUrl).toBe('https://sandbox-secure.xsolla.com/paystation4/?token=sandbox-token-scoped');
		} finally {
			globalThis.fetch = originalFetch;
			delete env.XSOLLA_ENV;
			delete env.XSOLLA_MERCHANT_ID;
			delete env.XSOLLA_PROJECT_ID;
			delete env.XSOLLA_API_KEY;
			delete env.XSOLLA_DURATION_3_MONTHS_SKU;
			delete env.XSOLLA_MERCHANT_ID_SANDBOX;
			delete env.XSOLLA_PROJECT_ID_SANDBOX;
			delete env.XSOLLA_API_KEY_SANDBOX;
			delete env.XSOLLA_DURATION_3_MONTHS_SKU_SANDBOX;
		}
	});

	it('returns xsolla validation details when a duration checkout token request is rejected upstream', async () => {
		env.XSOLLA_MERCHANT_ID = 'merchant-1';
		env.XSOLLA_PROJECT_ID = 'project-1';
		env.XSOLLA_API_KEY = 'api-key-1';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration-3-sku';

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

			if (url === 'https://store.xsolla.com/api/v3/project/project-1/admin/payment/token') {
				return new Response(JSON.stringify({
					statusCode: 422,
					errorCode: 1102,
					errorMessage: '[0401-1102]: Unprocessable Entity',
					errorMessageExtended: [
						{ property: 'purchase.items[0].quantity', message: 'The property quantity is required' },
					],
					transactionId: 'test-x-error-1',
				}), {
					status: 422,
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
				body: JSON.stringify({
					productId: 'duration_3_months',
					languageCode: 'vi-VN',
				}),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(422);
			const body = await response.json();
			expect(body.error).toBe('Xsolla checkout token request failed');
			expect(body.productId).toBe('duration_3_months');
			expect(body.status).toBe(422);
			expect(body.details.errorCode).toBe(1102);
			expect(body.details.errorMessageExtended[0].property).toBe('purchase.items[0].quantity');
		} finally {
			globalThis.fetch = originalFetch;
			delete env.XSOLLA_MERCHANT_ID;
			delete env.XSOLLA_PROJECT_ID;
			delete env.XSOLLA_API_KEY;
			delete env.XSOLLA_DURATION_3_MONTHS_SKU;
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

	it('rejects oversized xsolla webhook bodies before signature verification', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		const oversizedBody = JSON.stringify({
			notification_type: 'payment',
			padding: 'x'.repeat((70 * 1024)),
		});
		const request = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': String(new TextEncoder().encode(oversizedBody).byteLength),
				'CF-Connecting-IP': '203.0.113.55',
			},
			body: oversizedBody,
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(413);
		const body = await response.json();
		expect(body.error).toBe('Webhook body too large');
		delete env.XSOLLA_WEBHOOK_SECRET;
	});

	it('rate limits repeated xsolla webhook requests from the same ip', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		const rawBody = JSON.stringify({
			notification_type: 'payment',
			user: { id: userId },
		});

		for (let attempt = 0; attempt < 20; attempt += 1) {
			const request = new Request('http://example.com/api/xsolla/webhook', {
				method: 'POST',
				headers: {
					authorization: 'Signature deadbeef',
					'CF-Connecting-IP': '203.0.113.56',
				},
				body: rawBody,
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(401);
		}

		const blockedRequest = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			headers: {
				authorization: 'Signature deadbeef',
				'CF-Connecting-IP': '203.0.113.56',
			},
			body: rawBody,
		});
		const ctx = createExecutionContext();
		const blockedResponse = await worker.fetch(blockedRequest, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(blockedResponse.status).toBe(429);
		const body = await blockedResponse.json();
		expect(body.reason).toBe('webhook_rate_limit');
		expect(body.retryAfterSeconds).toBeGreaterThan(0);
		delete env.XSOLLA_WEBHOOK_SECRET;
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

	it('uses the production-specific xsolla webhook secret when XSOLLA_ENV=production', async () => {
		env.XSOLLA_ENV = 'production';
		env.XSOLLA_WEBHOOK_SECRET_PRODUCTION = 'prod-secret';
		const rawBody = JSON.stringify({ notification_type: 'user_validation', user: { id: userId } });
		const signature = await createXsollaSignature(rawBody, env.XSOLLA_WEBHOOK_SECRET_PRODUCTION);
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
		delete env.XSOLLA_ENV;
		delete env.XSOLLA_WEBHOOK_SECRET_PRODUCTION;
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
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('active');
		expect(stored.entitlement_kind).toBe('subscription');
		expect(stored.entitlement_plan).toBe('subscription_3_months');
		expect(stored.entitlement_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.billing_reference_id).toBe('551122');
		expect(stored.billing_reference_type).toBe('subscription_id');
		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID;
	});

	it('marks malformed create_subscription webhooks as failed', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID = 'WZ401Sj5';
		const rawBody = JSON.stringify({
			notification_type: 'create_subscription',
			user: {},
			subscription: {
				plan_id: 'WZ401Sj5',
				subscription_id: 551199,
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

		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.error).toBe('Unknown subscription webhook payload');

		const event = await env.DB.prepare(
			'SELECT notification_type, product_id, processing_status FROM xsolla_webhook_events WHERE xsolla_subscription_id = ?'
		).bind(551199).first();
		expect(event.notification_type).toBe('create_subscription');
		expect(event.product_id).toBe('subscription_3_months');
		expect(event.processing_status).toBe('failed');

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
			'SELECT entitlement_end, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.billing_reference_id).toBe('551122');
		expect(stored.billing_reference_type).toBe('subscription_id');

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
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, billing_reference_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('active');
		expect(stored.entitlement_kind).toBe('subscription');
		expect(stored.entitlement_plan).toBe('subscription_12_months');
		expect(stored.entitlement_end).toBe(Date.parse('2027-07-24T00:00:00+00:00'));
		expect(stored.billing_reference_id).toBe('991122');

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
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('active');
		expect(stored.entitlement_kind).toBe('duration');
		expect(stored.entitlement_plan).toBe('duration_3_months');
		expect(stored.entitlement_end).toBe(Date.parse('2026-07-24T00:00:00.000Z'));
		expect(stored.billing_reference_id).toBe('2002806344');
		expect(stored.billing_reference_type).toBe('transaction_id');
		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_DURATION_3_MONTHS_SKU;
	});

	it('grants one-time duration access when order_paid webhook uses user.external_id', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration_3_months';
		const paymentDate = '2026-04-24T00:00:00+00:00';
		const rawBody = JSON.stringify({
			notification_type: 'order_paid',
			user: { external_id: userId },
			order: { invoice_id: 2002806345 },
			transaction: { payment_date: paymentDate },
			items: [{ sku: 'duration_3_months', quantity: 1 }],
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
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('active');
		expect(stored.entitlement_kind).toBe('duration');
		expect(stored.entitlement_plan).toBe('duration_3_months');
		expect(stored.entitlement_end).toBe(Date.parse('2026-07-24T00:00:00.000Z'));
		expect(stored.billing_reference_id).toBe('2002806345');
		expect(stored.billing_reference_type).toBe('transaction_id');
		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_DURATION_3_MONTHS_SKU;
	});

	it('marks malformed order_paid webhooks as failed when no user id can be resolved', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration_3_months';
		const rawBody = JSON.stringify({
			notification_type: 'order_paid',
			order: { invoice_id: 2002806450 },
			transaction: { payment_date: '2026-04-24T00:00:00+00:00' },
			items: [{ sku: 'duration_3_months', quantity: 1 }],
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

		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.error).toBe('Missing user id');

		const event = await env.DB.prepare(
			'SELECT notification_type, product_id, processing_status, uid FROM xsolla_webhook_events WHERE xsolla_transaction_id = ?'
		).bind(2002806450).first();
		expect(event.notification_type).toBe('order_paid');
		expect(event.product_id).toBe('duration_3_months');
		expect(event.processing_status).toBe('failed');
		expect(event.uid).toBeNull();

		const stored = await env.DB.prepare(
			'SELECT entitlement_status FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored).toBeNull();

		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_DURATION_3_MONTHS_SKU;
	});

	it('reprocesses a failed order_paid webhook once the user id is present on retry', async () => {
		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration_3_months';
		const failedRawBody = JSON.stringify({
			notification_type: 'order_paid',
			order: { invoice_id: 2002806451 },
			transaction: { payment_date: '2026-04-24T00:00:00+00:00' },
			items: [{ sku: 'duration_3_months', quantity: 1 }],
		});
		const failedSignature = await createXsollaSignature(failedRawBody, env.XSOLLA_WEBHOOK_SECRET);
		const failedRequest = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			headers: {
				authorization: `Signature ${failedSignature}`,
			},
			body: failedRawBody,
		});

		let ctx = createExecutionContext();
		let response = await worker.fetch(failedRequest, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(400);

		const retriedRawBody = JSON.stringify({
			notification_type: 'order_paid',
			user: { external_id: userId },
			order: { invoice_id: 2002806451 },
			transaction: { payment_date: '2026-04-24T00:00:00+00:00' },
			items: [{ sku: 'duration_3_months', quantity: 1 }],
		});
		const retriedSignature = await createXsollaSignature(retriedRawBody, env.XSOLLA_WEBHOOK_SECRET);
		const retriedRequest = new Request('http://example.com/api/xsolla/webhook', {
			method: 'POST',
			headers: {
				authorization: `Signature ${retriedSignature}`,
			},
			body: retriedRawBody,
		});
		ctx = createExecutionContext();
		response = await worker.fetch(retriedRequest, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(204);

		const event = await env.DB.prepare(
			'SELECT processing_status, uid FROM xsolla_webhook_events WHERE xsolla_transaction_id = ?'
		).bind(2002806451).first();
		expect(event.processing_status).toBe('processed');
		expect(event.uid).toBe(userId);

		const stored = await env.DB.prepare(
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('active');
		expect(stored.entitlement_kind).toBe('duration');
		expect(stored.entitlement_plan).toBe('duration_3_months');
		expect(stored.billing_reference_id).toBe('2002806451');
		expect(stored.billing_reference_type).toBe('transaction_id');

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
			'SELECT entitlement_end, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_end).toBe(Date.parse('2026-07-24T00:00:00.000Z'));
		expect(stored.billing_reference_id).toBe('2002806344');
		expect(stored.billing_reference_type).toBe('transaction_id');

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
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, billing_reference_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('non_renewing');
		expect(stored.entitlement_kind).toBe('subscription');
		expect(stored.entitlement_plan).toBe('subscription_12_months');
		expect(stored.entitlement_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.billing_reference_id).toBe('991122');
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
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, billing_reference_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('non_renewing');
		expect(stored.entitlement_kind).toBe('subscription');
		expect(stored.entitlement_plan).toBe('subscription_12_months');
		expect(stored.entitlement_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.billing_reference_id).toBe('991122');

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
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, billing_reference_id FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('non_renewing');
		expect(stored.entitlement_kind).toBe('subscription');
		expect(stored.entitlement_plan).toBe('subscription_12_months');
		expect(stored.entitlement_end).toBe(Date.parse('2026-07-24T00:00:00+00:00'));
		expect(stored.billing_reference_id).toBe('991122');

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
			INSERT INTO users (
				uid, entitlement_status, entitlement_kind, entitlement_plan, entitlement_end,
				billing_provider, billing_reference_id, billing_reference_type, created_at, last_synced_at
			)
			VALUES (?, 'active', 'duration', 'duration_3_months', ?, 'xsolla', '2002806344', 'transaction_id', ?, ?)
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
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('inactive');
		expect(stored.entitlement_kind).toBeNull();
		expect(stored.entitlement_plan).toBeNull();
		expect(stored.entitlement_end).toBe(0);
		expect(stored.billing_reference_id).toBeNull();
		expect(stored.billing_reference_type).toBeNull();

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

	it('ignores refund webhooks that do not match the current duration entitlement reference', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (
				uid, entitlement_status, entitlement_kind, entitlement_plan, entitlement_end,
				billing_provider, billing_reference_id, billing_reference_type, created_at, last_synced_at
			)
			VALUES (?, 'active', 'duration', 'duration_3_months', ?, 'xsolla', '2002806344', 'transaction_id', ?, ?)
		`).bind(userId, nowMs + (30 * 24 * 60 * 60 * 1000), nowMs, nowMs).run();

		env.XSOLLA_WEBHOOK_SECRET = 'test-secret';
		env.XSOLLA_DURATION_3_MONTHS_SKU = 'duration_3_months';
		const rawBody = JSON.stringify({
			notification_type: 'refund',
			user: { id: userId },
			order: { invoice_id: 2002806999 },
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
			'SELECT entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(stored.entitlement_status).toBe('active');
		expect(stored.entitlement_kind).toBe('duration');
		expect(stored.entitlement_plan).toBe('duration_3_months');
		expect(stored.entitlement_end).toBeGreaterThan(nowMs);
		expect(stored.billing_reference_id).toBe('2002806344');
		expect(stored.billing_reference_type).toBe('transaction_id');

		delete env.XSOLLA_WEBHOOK_SECRET;
		delete env.XSOLLA_DURATION_3_MONTHS_SKU;
	});

	it('allows GET when token is valid and uid matches', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, email, display_name, level, xp, gro, star, current_land, inventory, game_data, created_at, last_synced_at, entitlement_status, entitlement_end, entitlement_plan)
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
			'inactive',
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
			INSERT INTO users (uid, email, display_name, level, xp, gro, star, current_land, inventory, game_data, created_at, last_synced_at, entitlement_status, entitlement_end, entitlement_plan)
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
			'inactive',
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
			INSERT INTO users (uid, email, display_name, level, xp, gro, star, current_land, inventory, game_data, created_at, last_synced_at, entitlement_status, entitlement_end, entitlement_plan)
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
			'inactive',
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
			INSERT INTO users (
				uid, entitlement_status, entitlement_kind, entitlement_plan, entitlement_end,
				billing_provider, billing_reference_id, billing_reference_type, created_at, last_synced_at
			)
			VALUES (?, 'active', 'subscription', 'subscription_12_months', ?, 'xsolla', '991122', 'subscription_id', ?, ?)
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

		const row = await env.DB.prepare('SELECT entitlement_status, entitlement_end, entitlement_plan FROM users WHERE uid = ?')
			.bind(userId)
			.first();
		expect(row).toBeTruthy();
		expect(row.entitlement_status).toBe('active');
		expect(row.entitlement_plan).toBe('subscription_12_months');
	});

	it('returns 409 for duration pass cancellation until refund flow is enabled', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (
				uid, email, entitlement_status, entitlement_kind, entitlement_plan, entitlement_end,
				billing_provider, billing_reference_id, billing_reference_type, created_at, last_synced_at
			)
			VALUES (?, 'test@example.com', 'active', 'duration', 'duration_3_months', ?, 'xsolla', '2002806344', 'transaction_id', ?, ?)
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
			expect(body.entitlementPlan).toBe('duration_3_months');
		});

		const row = await env.DB.prepare(
			'SELECT entitlement_status, entitlement_end, entitlement_plan, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
		).bind(userId).first();
		expect(row).toBeTruthy();
		expect(row.entitlement_status).toBe('active');
		expect(row.entitlement_end).toBeGreaterThan(nowMs);
		expect(row.entitlement_plan).toBe('duration_3_months');
		expect(row.billing_reference_id).toBe('2002806344');
		expect(row.billing_reference_type).toBe('transaction_id');
	});

	it('returns 409 when recurring xsolla subscription id is missing locally', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, entitlement_status, entitlement_kind, entitlement_plan, entitlement_end, created_at, last_synced_at)
			VALUES (?, 'active', 'subscription', 'subscription_12_months', ?, ?, ?)
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
			expect(body.entitlementPlan).toBe('subscription_12_months');
		});

		delete env.XSOLLA_MERCHANT_ID;
		delete env.XSOLLA_PROJECT_ID;
		delete env.XSOLLA_API_KEY;
	});

	it('claims daily routine reward once per date and updates xp/gro', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, email, display_name, level, xp, gro, star, current_land, inventory, game_data, created_at, last_synced_at, entitlement_status, entitlement_end, entitlement_plan)
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
			'inactive',
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
