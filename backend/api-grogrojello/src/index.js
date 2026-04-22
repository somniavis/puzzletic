/**
 * Cloudflare Worker for Grogrojello
 * Handles sync between Client and D1 Database
 */

const FIREBASE_DEFAULT_PROJECT_ID = 'grogro-jello-4a53a';
const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const MAX_JSON_BODY_BYTES = 256 * 1024;
const ALLOWED_ORIGINS = new Set([
	'https://grogrojello.com',
	'https://www.grogrojello.com',
	'http://localhost:5173',
	'http://175.214.49.200:5173',
	'http://175.214.49.200:4173',
]);
const DEFAULT_ALLOWED_ORIGIN = 'https://grogrojello.com';
const PRIVATE_DEV_ORIGIN_RE = /^http:\/\/(?:(?:localhost)|(?:10(?:\.\d{1,3}){3})|(?:172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})|(?:192\.168(?:\.\d{1,3}){2})):\d+$/;

let firebaseJwksCache = null;
let firebaseJwksExpiry = 0;

const RATE_LIMIT_RULES = {
	userRead: {
		preAuth: [
			{ keySuffix: 'burst', limit: 8, windowMs: 10_000, blockMs: 60_000 },
			{ keySuffix: 'window', limit: 20, windowMs: 60_000, blockMs: 5 * 60_000 },
		],
		postAuth: [
			{ keySuffix: 'burst', limit: 6, windowMs: 10_000, blockMs: 60_000 },
			{ keySuffix: 'window', limit: 15, windowMs: 60_000, blockMs: 5 * 60_000 },
		],
	},
	userSync: {
		preAuth: [
			{ keySuffix: 'burst', limit: 4, windowMs: 10_000, blockMs: 90_000 },
			{ keySuffix: 'window', limit: 10, windowMs: 60_000, blockMs: 10 * 60_000 },
		],
		postAuth: [
			{ keySuffix: 'burst', limit: 3, windowMs: 10_000, blockMs: 90_000 },
			{ keySuffix: 'window', limit: 8, windowMs: 60_000, blockMs: 10 * 60_000 },
		],
		cooldownMs: 2_000,
	},
	dailyRoutineClaim: {
		preAuth: [
			{ keySuffix: 'burst', limit: 2, windowMs: 10_000, blockMs: 3 * 60_000 },
			{ keySuffix: 'window', limit: 3, windowMs: 60_000, blockMs: 15 * 60_000 },
		],
		postAuth: [
			{ keySuffix: 'burst', limit: 2, windowMs: 10_000, blockMs: 3 * 60_000 },
			{ keySuffix: 'window', limit: 3, windowMs: 60_000, blockMs: 15 * 60_000 },
		],
	},
};

const AUTH_FAILURE_RULES = [
	{ keySuffix: 'burst', limit: 5, windowMs: 60_000, blockMs: 10 * 60_000 },
	{ keySuffix: 'window', limit: 12, windowMs: 15 * 60_000, blockMs: 30 * 60_000 },
];

const DAILY_ROUTINE_REWARD_TABLE = {
	1: {
		normal: { gro: 12, xp: 2, chance: 0.7 },
		bonus: { gro: 16, xp: 3, chance: 0.25 },
		jackpot: { gro: 20, xp: 4, chance: 0.05 },
	},
	2: {
		normal: { gro: 18, xp: 3, chance: 0.7 },
		bonus: { gro: 24, xp: 4, chance: 0.25 },
		jackpot: { gro: 30, xp: 5, chance: 0.05 },
	},
	3: {
		normal: { gro: 28, xp: 4, chance: 0.7 },
		bonus: { gro: 36, xp: 5, chance: 0.25 },
		jackpot: { gro: 45, xp: 7, chance: 0.05 },
	},
	4: {
		normal: { gro: 40, xp: 6, chance: 0.7 },
		bonus: { gro: 52, xp: 8, chance: 0.25 },
		jackpot: { gro: 65, xp: 10, chance: 0.05 },
	},
	5: {
		normal: { gro: 55, xp: 8, chance: 0.7 },
		bonus: { gro: 70, xp: 10, chance: 0.25 },
		jackpot: { gro: 85, xp: 13, chance: 0.05 },
	},
};

const MAX_GRO_DELTA = 3000;
const MAX_XP_DELTA = 1000;
const MAX_STAR_DELTA = 50;
const MAX_INITIAL_GRO = 10000;
const MAX_INITIAL_XP = 250;
const MAX_INITIAL_STAR = 100;
const MAX_LEVEL = 5;
const MAX_STAR_TOTAL = 100000;

const clampStage = (stage) => Math.min(5, Math.max(1, Math.floor(Number(stage) || 1)));

const generateDailyRoutineReward = (stage) => {
	const clampedStage = clampStage(stage);
	const stageReward = DAILY_ROUTINE_REWARD_TABLE[clampedStage];
	const roll = Math.random();

	if (roll < stageReward.normal.chance) {
		return { gro: stageReward.normal.gro, xp: stageReward.normal.xp, tier: 'normal' };
	}

	if (roll < stageReward.normal.chance + stageReward.bonus.chance) {
		return { gro: stageReward.bonus.gro, xp: stageReward.bonus.xp, tier: 'bonus' };
	}

	return { gro: stageReward.jackpot.gro, xp: stageReward.jackpot.xp, tier: 'jackpot' };
};

const base64UrlToUint8Array = (input) => {
	const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
};

const base64UrlToJson = (input) => {
	const bytes = base64UrlToUint8Array(input);
	const text = new TextDecoder().decode(bytes);
	return JSON.parse(text);
};

const parseMaxAgeSeconds = (cacheControl) => {
	if (!cacheControl) return 300;
	const match = cacheControl.match(/max-age=(\d+)/i);
	if (!match) return 300;
	const parsed = Number.parseInt(match[1], 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
};

const normalizeRouteSegment = (value) => String(value || '').replace(/[^a-zA-Z0-9:_-]/g, '_');
const truncateForLog = (value, max = 120) => String(value || '').slice(0, max);
const isSafeIntegerInRange = (value, min, max) =>
	Number.isSafeInteger(value) && value >= min && value <= max;

const logSecurityEvent = (type, details = {}) => {
	const payload = {
		channel: 'security',
		type,
		ts: new Date().toISOString(),
		...details,
	};
	console.warn(JSON.stringify(payload));
};

const getClientIp = (request) => {
	const cfIp = request.headers.get('CF-Connecting-IP');
	if (cfIp) return cfIp.trim();

	const forwardedFor = request.headers.get('X-Forwarded-For');
	if (forwardedFor) {
		return forwardedFor.split(',')[0].trim();
	}

	return 'unknown';
};

const getRequestId = (request) => {
	return truncateForLog(
		request.headers.get('CF-Ray') ||
		request.headers.get('X-Request-ID') ||
		`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
	);
};

const getRouteGroup = (request, path) => {
	if (request.method === 'GET') return 'userRead';
	if (path.endsWith('/daily-routine-claim')) return 'dailyRoutineClaim';
	return 'userSync';
};

const getUserRouteInfo = (path) => {
	const pathSegments = path.split('/');
	const uid = pathSegments[3];
	const subPath = pathSegments[4] || '';
	const extraSegments = pathSegments.length > 5;

	if (!uid || uid === 'purchase') {
		return { ok: false, status: 400, error: 'Missing UID' };
	}

	if (extraSegments) {
		return { ok: false, status: 404, error: 'Unknown API path' };
	}

	if (subPath && !['purchase', 'cancel', 'daily-routine-claim'].includes(subPath)) {
		return { ok: false, status: 404, error: 'Unknown API path' };
	}

	return { ok: true, uid, subPath };
};

const getBodySize = (request) => {
	const contentLength = request.headers.get('Content-Length');
	if (!contentLength) return null;
	const parsed = Number(contentLength);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const validateApiRequestShape = (request, routeInfo) => {
	if (!['GET', 'POST', 'OPTIONS'].includes(request.method)) {
		return { ok: false, status: 405, error: 'Method Not Allowed', headers: { Allow: 'GET, POST, OPTIONS' } };
	}

	if (request.method === 'GET' && routeInfo.subPath) {
		return { ok: false, status: 405, error: 'Method Not Allowed', headers: { Allow: 'POST, OPTIONS' } };
	}

	if (request.method === 'POST') {
		const requiresJsonBody = !routeInfo.subPath || routeInfo.subPath === 'purchase' || routeInfo.subPath === 'daily-routine-claim';
		if (requiresJsonBody) {
			const contentType = request.headers.get('Content-Type') || '';
			if (!contentType.toLowerCase().includes('application/json')) {
				return { ok: false, status: 415, error: 'Expected application/json body' };
			}

			const bodySize = getBodySize(request);
			if (bodySize !== null && bodySize > MAX_JSON_BODY_BYTES) {
				return { ok: false, status: 413, error: 'Request body too large' };
			}
		}
	}

	return { ok: true };
};

const buildRateLimitHeaders = (retryAfterSeconds) => ({
	'Content-Type': 'application/json',
	'Retry-After': String(retryAfterSeconds),
});

const evaluateRateLimit = async (db, key, now, rule) => {
	const existing = await db.prepare(
		'SELECT count, window_start, blocked_until FROM api_rate_limits WHERE key = ?'
	).bind(key).first();

	if (existing?.blocked_until && existing.blocked_until > now) {
		return {
			allowed: false,
			retryAfterMs: existing.blocked_until - now,
		};
	}

	if (!existing || now - existing.window_start >= rule.windowMs) {
		await db.prepare(`
			INSERT INTO api_rate_limits (key, count, window_start, last_seen, blocked_until)
			VALUES (?, 1, ?, ?, 0)
			ON CONFLICT(key) DO UPDATE SET
				count = 1,
				window_start = excluded.window_start,
				last_seen = excluded.last_seen,
				blocked_until = 0
		`).bind(key, now, now).run();

		return { allowed: true, retryAfterMs: 0 };
	}

	const nextCount = (existing.count || 0) + 1;
	if (nextCount > rule.limit) {
		const blockedUntil = now + rule.blockMs;
		await db.prepare(`
			UPDATE api_rate_limits
			SET count = ?, last_seen = ?, blocked_until = ?
			WHERE key = ?
		`).bind(nextCount, now, blockedUntil, key).run();

		return {
			allowed: false,
			retryAfterMs: blockedUntil - now,
		};
	}

	await db.prepare(`
		UPDATE api_rate_limits
		SET count = ?, last_seen = ?, blocked_until = 0
		WHERE key = ?
	`).bind(nextCount, now, key).run();

	return { allowed: true, retryAfterMs: 0 };
};

const enforceRateLimitRules = async (db, prefix, now, rules) => {
	let maxRetryAfterMs = 0;

	for (const rule of rules) {
		const key = `${prefix}:${rule.keySuffix}`;
		const result = await evaluateRateLimit(db, key, now, rule);
		if (!result.allowed) {
			maxRetryAfterMs = Math.max(maxRetryAfterMs, result.retryAfterMs || 0);
		}
	}

	if (maxRetryAfterMs > 0) {
		return { ok: false, retryAfterMs: maxRetryAfterMs };
	}

	return { ok: true, retryAfterMs: 0 };
};

const enforceCooldown = async (db, key, now, cooldownMs) => {
	const existing = await db.prepare(
		'SELECT last_seen FROM api_rate_limits WHERE key = ?'
	).bind(key).first();

	if (existing?.last_seen && now - existing.last_seen < cooldownMs) {
		return { ok: false, retryAfterMs: cooldownMs - (now - existing.last_seen) };
	}

	await db.prepare(`
		INSERT INTO api_rate_limits (key, count, window_start, last_seen, blocked_until)
		VALUES (?, 1, ?, ?, 0)
		ON CONFLICT(key) DO UPDATE SET
			count = 1,
			window_start = excluded.window_start,
			last_seen = excluded.last_seen,
			blocked_until = 0
	`).bind(key, now, now).run();

	return { ok: true, retryAfterMs: 0 };
};

const createRateLimitResponse = (corsHeaders, reason, retryAfterMs) => {
	const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
	return new Response(JSON.stringify({
		error: 'Too Many Requests',
		reason,
		retryAfterSeconds,
	}), {
		status: 429,
		headers: { ...corsHeaders, ...buildRateLimitHeaders(retryAfterSeconds) }
	});
};

const recordFailedAuthAttempt = async (env, ip, uid, now) => {
	const keyBase = `authfail:${normalizeRouteSegment(ip)}:${normalizeRouteSegment(uid)}`;
	return enforceRateLimitRules(env.DB, keyBase, now, AUTH_FAILURE_RULES);
};

const getFirebaseJwks = async () => {
	const now = Date.now();
	if (firebaseJwksCache && now < firebaseJwksExpiry) {
		return firebaseJwksCache;
	}

	const response = await fetch(FIREBASE_JWKS_URL, { method: 'GET' });
	if (!response.ok) {
		throw new Error(`Failed to fetch Firebase JWKs: ${response.status}`);
	}

	const jwks = await response.json();
	const cacheControl = response.headers.get('cache-control');
	const maxAgeSeconds = parseMaxAgeSeconds(cacheControl);

	firebaseJwksCache = jwks;
	firebaseJwksExpiry = now + (maxAgeSeconds * 1000);
	return firebaseJwksCache;
};

const verifyFirebaseIdToken = async (token, projectId) => {
	const parts = token.split('.');
	if (parts.length !== 3) {
		throw new Error('Malformed JWT');
	}

	const header = base64UrlToJson(parts[0]);
	const payload = base64UrlToJson(parts[1]);

	if (header.alg !== 'RS256') {
		throw new Error('Invalid JWT alg');
	}
	if (!header.kid) {
		throw new Error('Missing JWT kid');
	}

	const nowSeconds = Math.floor(Date.now() / 1000);
	const expectedIssuer = `https://securetoken.google.com/${projectId}`;

	if (payload.iss !== expectedIssuer) {
		throw new Error('Invalid issuer');
	}
	if (payload.aud !== projectId) {
		throw new Error('Invalid audience');
	}
	if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length === 0) {
		throw new Error('Invalid subject');
	}
	if (!payload.exp || payload.exp <= nowSeconds) {
		throw new Error('Token expired');
	}
	if (!payload.iat || payload.iat > nowSeconds) {
		throw new Error('Invalid iat');
	}
	if (payload.auth_time && payload.auth_time > nowSeconds) {
		throw new Error('Invalid auth_time');
	}

	const jwks = await getFirebaseJwks();
	const jwk = Array.isArray(jwks.keys) ? jwks.keys.find((k) => k.kid === header.kid) : null;
	if (!jwk) {
		firebaseJwksCache = null;
		firebaseJwksExpiry = 0;
		const refreshed = await getFirebaseJwks();
		const retried = Array.isArray(refreshed.keys) ? refreshed.keys.find((k) => k.kid === header.kid) : null;
		if (!retried) {
			throw new Error('Unknown signing key');
		}
		const verified = await crypto.subtle.importKey(
			'jwk',
			retried,
			{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
			false,
			['verify']
		);
		const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
		const signature = base64UrlToUint8Array(parts[2]);
		const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', verified, signature, data);
		if (!ok) throw new Error('Invalid signature');
		return payload;
	}

	const publicKey = await crypto.subtle.importKey(
		'jwk',
		jwk,
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['verify']
	);

	const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
	const signature = base64UrlToUint8Array(parts[2]);
	const isValidSignature = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, signature, data);
	if (!isValidSignature) {
		throw new Error('Invalid signature');
	}

	return payload;
};

const authenticateRequest = async (request, env, uidFromPath) => {
	const authHeader = request.headers.get('Authorization') || '';
	if (!authHeader.startsWith('Bearer ')) {
		return { ok: false, status: 401, error: 'Missing or invalid Authorization header' };
	}

	const token = authHeader.slice('Bearer '.length).trim();
	if (!token) {
		return { ok: false, status: 401, error: 'Missing bearer token' };
	}

	const projectId = env.FIREBASE_PROJECT_ID || FIREBASE_DEFAULT_PROJECT_ID;
	try {
		const claims = await verifyFirebaseIdToken(token, projectId);
		if (claims.sub !== uidFromPath) {
			return { ok: false, status: 403, error: 'UID mismatch' };
		}
		return { ok: true, claims };
	} catch (err) {
		return { ok: false, status: 401, error: `Unauthorized: ${err.message}` };
	}
};

const getCorsHeaders = (request) => {
	const requestOrigin = request.headers.get('Origin');
	const isAllowedDevOrigin = requestOrigin ? PRIVATE_DEV_ORIGIN_RE.test(requestOrigin) : false;
	const allowedOrigin = requestOrigin && (ALLOWED_ORIGINS.has(requestOrigin) || isAllowedDevOrigin)
		? requestOrigin
		: !requestOrigin
			? DEFAULT_ALLOWED_ORIGIN
			: null;

	const headers = {
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
		'Vary': 'Origin',
	};

	if (allowedOrigin) {
		headers['Access-Control-Allow-Origin'] = allowedOrigin;
	}

	return { headers, allowedOrigin, requestOrigin };
};

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;
		const now = Date.now();
		const requestId = getRequestId(request);
		const clientIp = normalizeRouteSegment(getClientIp(request));

		// CORS Headers
		const corsContext = getCorsHeaders(request);
		const corsHeaders = corsContext.headers;
		if (corsContext.requestOrigin && !corsContext.allowedOrigin) {
			logSecurityEvent('cors_origin_denied', {
				requestId,
				ip: clientIp,
				origin: truncateForLog(corsContext.requestOrigin),
				path: truncateForLog(path),
				method: request.method,
			});
		}

		// Handle OPTIONS (CORS preflight)
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Router
		if (path.startsWith('/api/users/')) {
			const routeInfo = getUserRouteInfo(path);
			if (!routeInfo.ok) {
				logSecurityEvent('invalid_api_path', {
					requestId,
					ip: clientIp,
					path: truncateForLog(path),
					method: request.method,
				});
				return new Response(JSON.stringify({ error: routeInfo.error }), {
					status: routeInfo.status,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}

			const requestShape = validateApiRequestShape(request, routeInfo);
			if (!requestShape.ok) {
				logSecurityEvent('request_shape_rejected', {
					requestId,
					ip: clientIp,
					path: truncateForLog(path),
					method: request.method,
					reason: requestShape.error,
					subPath: routeInfo.subPath || 'root',
				});
				return new Response(JSON.stringify({ error: requestShape.error }), {
					status: requestShape.status,
					headers: { ...corsHeaders, 'Content-Type': 'application/json', ...(requestShape.headers || {}) }
				});
			}

			const { uid } = routeInfo;
			const routeGroup = getRouteGroup(request, path);
			const routeRules = RATE_LIMIT_RULES[routeGroup];

			if (routeRules?.preAuth?.length) {
				const preAuthResult = await enforceRateLimitRules(
					env.DB,
					`preauth:${clientIp}:${normalizeRouteSegment(uid)}:${routeGroup}`,
					now,
					routeRules.preAuth
				);
				if (!preAuthResult.ok) {
					logSecurityEvent('rate_limit_hit', {
						requestId,
						stage: 'preauth',
						ip: clientIp,
						uid: normalizeRouteSegment(uid),
						routeGroup,
						path: truncateForLog(path),
						method: request.method,
						retryAfterMs: preAuthResult.retryAfterMs,
					});
					return createRateLimitResponse(corsHeaders, 'preauth_rate_limit', preAuthResult.retryAfterMs);
				}
			}

			const authResult = await authenticateRequest(request, env, uid);
			if (!authResult.ok) {
				const authFailureResult = await recordFailedAuthAttempt(env, clientIp, uid, now);
				logSecurityEvent('auth_rejected', {
					requestId,
					ip: clientIp,
					uid: normalizeRouteSegment(uid),
					routeGroup,
					path: truncateForLog(path),
					method: request.method,
					status: authResult.status,
					error: truncateForLog(authResult.error),
				});
				if (!authFailureResult.ok) {
					logSecurityEvent('rate_limit_hit', {
						requestId,
						stage: 'authfail',
						ip: clientIp,
						uid: normalizeRouteSegment(uid),
						routeGroup,
						path: truncateForLog(path),
						method: request.method,
						retryAfterMs: authFailureResult.retryAfterMs,
					});
					return createRateLimitResponse(corsHeaders, 'auth_failure_limit', authFailureResult.retryAfterMs);
				}
				return new Response(JSON.stringify({ error: authResult.error }), {
					status: authResult.status,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}

			if (routeRules?.postAuth?.length) {
				const postAuthResult = await enforceRateLimitRules(
					env.DB,
					`auth:${normalizeRouteSegment(authResult.claims.sub)}:${routeGroup}`,
					now,
					routeRules.postAuth
				);
				if (!postAuthResult.ok) {
					logSecurityEvent('rate_limit_hit', {
						requestId,
						stage: 'postauth',
						ip: clientIp,
						uid: normalizeRouteSegment(authResult.claims.sub),
						routeGroup,
						path: truncateForLog(path),
						method: request.method,
						retryAfterMs: postAuthResult.retryAfterMs,
					});
					return createRateLimitResponse(corsHeaders, 'user_rate_limit', postAuthResult.retryAfterMs);
				}
			}

			if (routeRules?.cooldownMs) {
				const cooldownResult = await enforceCooldown(
					env.DB,
					`cooldown:${normalizeRouteSegment(authResult.claims.sub)}:${routeGroup}`,
					now,
					routeRules.cooldownMs
				);
				if (!cooldownResult.ok) {
					logSecurityEvent('rate_limit_hit', {
						requestId,
						stage: 'cooldown',
						ip: clientIp,
						uid: normalizeRouteSegment(authResult.claims.sub),
						routeGroup,
						path: truncateForLog(path),
						method: request.method,
						retryAfterMs: cooldownResult.retryAfterMs,
					});
					return createRateLimitResponse(corsHeaders, 'action_cooldown', cooldownResult.retryAfterMs);
				}
			}

			// GET: Retrieve User Data
			if (request.method === 'GET') {
				try {
					const stmt = env.DB.prepare('SELECT * FROM users WHERE uid = ?').bind(uid);
					const result = await stmt.first();

					if (!result) {
						return new Response(JSON.stringify({ found: false }), {
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}

					// Check Subscription Expiry
					if (result.is_premium === 1 && result.subscription_end && result.subscription_end < now) {
						// console.log(`[Subscription] Expired for user ${uid}. Downgrading.`); // Keep as a comment if needed for debugging
						result.is_premium = 0;
						// Downgrade expired subscription in DB
						await env.DB.prepare('UPDATE users SET is_premium = 0 WHERE uid = ?').bind(uid).run();
					}

					// Parse JSON fields
					if (result.inventory) result.inventory = JSON.parse(result.inventory);
					if (result.game_data) result.gameData = JSON.parse(result.game_data);

					return new Response(JSON.stringify({ found: true, data: result }), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				} catch (err) {
					return new Response(JSON.stringify({ error: err.message }), {
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}
			}

			// POST: Sync/Upsert User Data
			if (request.method === 'POST') {
				// Check if this is a purchase request (sub-path)
				// Since we are inside /api/users/:uid block, check if url ends with /purchase
				if (path.endsWith('/purchase')) {
					try {
						const body = await request.json();
						const { planId } = body; // '3_months' or '12_months'

						if (!['3_months', '12_months'].includes(planId)) {
							return new Response(JSON.stringify({ error: 'Invalid Plan ID' }), { status: 400, headers: corsHeaders });
						}

						let duration = 0;
						if (planId === '3_months') duration = 90 * 24 * 60 * 60 * 1000;
						if (planId === '12_months') duration = 365 * 24 * 60 * 60 * 1000;

						// Get current end date to extend it if already active
						const currentStmt = env.DB.prepare('SELECT subscription_end FROM users WHERE uid = ?').bind(uid);
						const currentData = await currentStmt.first();

						let newEnd = now + duration;
						// If currently active, extend from current end date
						if (currentData && currentData.subscription_end > now) {
							newEnd = currentData.subscription_end + duration;
						}

						// Upsert DB row to guarantee subscription state is persisted
						await env.DB.prepare(`
							INSERT INTO users (
								uid, is_premium, subscription_end, subscription_plan, created_at, last_synced_at
							)
							VALUES (?, 1, ?, ?, ?, ?)
							ON CONFLICT(uid) DO UPDATE SET
								is_premium = 1,
								subscription_end = excluded.subscription_end,
								subscription_plan = excluded.subscription_plan,
								last_synced_at = excluded.last_synced_at
						`).bind(uid, newEnd, planId, now, now).run();

						return new Response(JSON.stringify({ success: true, is_premium: 1, subscription_end: newEnd, plan: planId }), {
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});

					} catch (err) {
						return new Response(JSON.stringify({ error: err.message }), {
							status: 500,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
				}

				// Cancel Subscription Endpoint
				if (path.endsWith('/cancel')) {
					try {
						await env.DB.prepare(`
							INSERT INTO users (
								uid, is_premium, subscription_end, subscription_plan, created_at, last_synced_at
							)
							VALUES (?, 0, 0, NULL, ?, ?)
							ON CONFLICT(uid) DO UPDATE SET
								is_premium = 0,
								subscription_end = 0,
								subscription_plan = NULL,
								last_synced_at = excluded.last_synced_at
						`).bind(uid, now, now).run();

						return new Response(JSON.stringify({ success: true, is_premium: 0 }), {
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					} catch (err) {
						return new Response(JSON.stringify({ error: err.message }), {
							status: 500,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
				}

				if (path.endsWith('/daily-routine-claim')) {
					try {
						const body = await request.json();
						const rawDateKey = body.dateKey || body.date_key;
						const dateKey = typeof rawDateKey === 'string' ? rawDateKey.trim() : '';

						if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
							return new Response(JSON.stringify({ error: 'Invalid dateKey' }), {
								status: 400,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}

						const currentUser = await env.DB.prepare(
							'SELECT level, xp, gro FROM users WHERE uid = ?'
						).bind(uid).first();

						if (!currentUser) {
							return new Response(JSON.stringify({ error: 'User not found' }), {
								status: 404,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}

						const insertClaim = await env.DB.prepare(`
							INSERT OR IGNORE INTO daily_routine_claims (uid, date_key, claimed_at)
							VALUES (?, ?, ?)
						`).bind(uid, dateKey, now).run();

						if (!insertClaim.meta?.changes) {
							return new Response(JSON.stringify({ success: false, alreadyClaimed: true }), {
								status: 409,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}

						const reward = generateDailyRoutineReward(currentUser.level || 1);

						await env.DB.prepare(`
							UPDATE users
							SET xp = ?, gro = ?, last_synced_at = ?
							WHERE uid = ?
						`).bind(
							(currentUser.xp || 0) + reward.xp,
							(currentUser.gro || 0) + reward.gro,
							now,
							uid
						).run();

						return new Response(JSON.stringify({
							success: true,
							reward,
							claimedAt: now,
						}), {
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					} catch (err) {
						return new Response(JSON.stringify({ error: err.message }), {
							status: 500,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
				}

				// --- Normal Sync Logic (POST /api/users/:uid) ---
				try {
					const body = await request.json();
					// Accept both snake_case (new) and camelCase (legacy) field names
					const email = body.email;
					const displayName = body.display_name || body.displayName;
					const level = body.level;
					const xp = body.xp;
					const gro = body.gro;
					const star = body.star;
					const currentLand = body.current_land || body.currentLand;
					const inventory = body.inventory;
					const gameData = body.game_data || body.gameData;
					const createdAt = body.created_at || body.createdAt;

					if (!isSafeIntegerInRange(level, 1, MAX_LEVEL)) {
						return new Response(JSON.stringify({ error: 'Invalid level value' }), {
							status: 400,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
					if (!isSafeIntegerInRange(gro, 0, Number.MAX_SAFE_INTEGER)) {
						return new Response(JSON.stringify({ error: 'Invalid Gro value' }), {
							status: 400,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
					if (!isSafeIntegerInRange(xp, 0, Number.MAX_SAFE_INTEGER)) {
						return new Response(JSON.stringify({ error: 'Invalid XP value' }), {
							status: 400,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
					if (!isSafeIntegerInRange(star, 0, MAX_STAR_TOTAL)) {
						return new Response(JSON.stringify({ error: 'Invalid star value' }), {
							status: 400,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
					if (typeof currentLand !== 'string' || currentLand.length === 0) {
						return new Response(JSON.stringify({ error: 'Invalid current_land value' }), {
							status: 400,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
					if (!Array.isArray(inventory)) {
						return new Response(JSON.stringify({ error: 'Invalid inventory format' }), {
							status: 400,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
					}
					const normalizedGameData = typeof gameData === 'string'
						? gameData
						: JSON.stringify(gameData || {});

					const currentStmt = env.DB.prepare('SELECT gro, xp, star, level FROM users WHERE uid = ?').bind(uid);
					const currentData = await currentStmt.first();

					if (currentData) {
						const deltaGro = gro - currentData.gro;
						const deltaXp = xp - currentData.xp;
						const deltaStar = star - (currentData.star || 0);

						if (deltaGro > MAX_GRO_DELTA) {
							logSecurityEvent('abnormal_value_rejected', {
								requestId,
								ip: clientIp,
								uid: normalizeRouteSegment(uid),
								routeGroup,
								path: truncateForLog(path),
								method: request.method,
								field: 'gro',
								delta: deltaGro,
								limit: MAX_GRO_DELTA,
							});
							return new Response(JSON.stringify({ error: 'Security Alert: Abnormal currency gain detected.' }), {
								status: 400,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}

						if (deltaXp > MAX_XP_DELTA) {
							logSecurityEvent('abnormal_value_rejected', {
								requestId,
								ip: clientIp,
								uid: normalizeRouteSegment(uid),
								routeGroup,
								path: truncateForLog(path),
								method: request.method,
								field: 'xp',
								delta: deltaXp,
								limit: MAX_XP_DELTA,
							});
							return new Response(JSON.stringify({ error: 'Security Alert: Abnormal XP gain detected.' }), {
								status: 400,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}
						if (deltaStar > MAX_STAR_DELTA) {
							logSecurityEvent('abnormal_value_rejected', {
								requestId,
								ip: clientIp,
								uid: normalizeRouteSegment(uid),
								routeGroup,
								path: truncateForLog(path),
								method: request.method,
								field: 'star',
								delta: deltaStar,
								limit: MAX_STAR_DELTA,
							});
							return new Response(JSON.stringify({ error: 'Security Alert: Abnormal star gain detected.' }), {
								status: 400,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}
					} else {
						if (gro > MAX_INITIAL_GRO) {
							return new Response(JSON.stringify({ error: 'Security Alert: Invalid initial Gro value.' }), {
								status: 400,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}
						if (xp > MAX_INITIAL_XP) {
							return new Response(JSON.stringify({ error: 'Security Alert: Invalid initial XP value.' }), {
								status: 400,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}
						if (star > MAX_INITIAL_STAR) {
							return new Response(JSON.stringify({ error: 'Security Alert: Invalid initial star value.' }), {
								status: 400,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}
					}

					const stmt = env.DB.prepare(`
            INSERT INTO users (uid, email, display_name, level, xp, gro, star, current_land, inventory, game_data, created_at, last_synced_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET
              email = excluded.email,
              display_name = excluded.display_name,
              level = excluded.level,
              xp = excluded.xp,
              gro = excluded.gro,
              star = excluded.star,
              current_land = excluded.current_land,
              inventory = excluded.inventory,
              game_data = excluded.game_data,
              last_synced_at = excluded.last_synced_at
          `).bind(
						uid,
						email || null,
						displayName || null,
						level,
						xp,
						gro,
						star,
						currentLand,
						JSON.stringify(inventory),
						normalizedGameData,
						createdAt || null,
						now
					);

					await stmt.run();

					return new Response(JSON.stringify({ success: true, syncedAt: now }), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				} catch (err) {
					return new Response(JSON.stringify({ error: err.message }), {
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}
			}
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	},
};
