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
		await env.DB.prepare('DROP TABLE IF EXISTS users').run();
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
				subscription_plan TEXT
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

	it('upserts premium state on purchase even when user row does not exist', async () => {
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
			const request = new Request(`http://example.com/api/users/${userId}/purchase`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ planId: '3_months' }),
			});
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.is_premium).toBe(1);
			expect(body.plan).toBe('3_months');
		});

		const row = await env.DB.prepare('SELECT is_premium, subscription_plan FROM users WHERE uid = ?')
			.bind(userId)
			.first();
		expect(row).toBeTruthy();
		expect(row.is_premium).toBe(1);
		expect(row.subscription_plan).toBe('3_months');
	});

	it('clears premium state on cancel endpoint', async () => {
		const nowMs = Date.now();
		await env.DB.prepare(`
			INSERT INTO users (uid, is_premium, subscription_end, subscription_plan, created_at, last_synced_at)
			VALUES (?, 1, ?, '12_months', ?, ?)
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

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.is_premium).toBe(0);
		});

		const row = await env.DB.prepare('SELECT is_premium, subscription_end, subscription_plan FROM users WHERE uid = ?')
			.bind(userId)
			.first();
		expect(row).toBeTruthy();
		expect(row.is_premium).toBe(0);
		expect(row.subscription_end).toBe(0);
		expect(row.subscription_plan).toBeNull();
	});
});
