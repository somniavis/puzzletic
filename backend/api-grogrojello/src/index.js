/**
 * Cloudflare Worker for Grogrojello
 * Handles sync between Client and D1 Database
 */

const FIREBASE_DEFAULT_PROJECT_ID = 'grogro-jello-4a53a';
const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const MAX_JSON_BODY_BYTES = 256 * 1024;
const XSOLLA_WEBHOOK_MAX_BODY_BYTES = 64 * 1024;
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
	webhook: {
		preAuth: [
			{ keySuffix: 'burst', limit: 20, windowMs: 10_000, blockMs: 60_000 },
			{ keySuffix: 'window', limit: 80, windowMs: 60_000, blockMs: 5 * 60_000 },
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
const XSOLLA_WEBHOOK_PATH = '/api/xsolla/webhook';
const XSOLLA_SUBSCRIPTION_TOKEN_URL = (merchantId) => `https://api.xsolla.com/merchant/v2/merchants/${merchantId}/token`;
const XSOLLA_CATALOG_TOKEN_URL = (projectId) => `https://store.xsolla.com/api/v3/project/${projectId}/admin/payment/token`;
const XSOLLA_UPDATE_SUBSCRIPTION_URL = (projectId, userId, subscriptionId) =>
	`https://api.xsolla.com/merchant/v2/projects/${projectId}/users/${encodeURIComponent(userId)}/subscriptions/${subscriptionId}`;
const XSOLLA_REFUND_URL = (merchantId, transactionId) =>
	`https://api.xsolla.com/merchant/v2/merchants/${merchantId}/reports/transactions/${transactionId}/refund`;
const DEFAULT_XSOLLA_RETURN_URL = 'https://www.grogrojello.com/profile?tab=my_jello';
const XSOLLA_RETURN_PATH = '/profile?tab=my_jello';
const XSOLLA_ENVIRONMENTS = {
	sandbox: {
		checkoutBaseUrl: 'https://sandbox-secure.xsolla.com/paystation4/',
		subscriptionMode: 'sandbox',
		catalogSandbox: true,
	},
	production: {
		checkoutBaseUrl: 'https://secure.xsolla.com/paystation4/',
		subscriptionMode: 'live',
		catalogSandbox: false,
	},
};

const XSOLLA_PRODUCTS = {
	subscription_3_months: {
		id: 'subscription_3_months',
		kind: 'regular_subscription',
		durationMonths: 3,
		displayName: '3-month subscription',
		xsollaIdentifierEnvKeyBase: 'XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID',
	},
	subscription_12_months: {
		id: 'subscription_12_months',
		kind: 'regular_subscription',
		durationMonths: 12,
		displayName: '12-month subscription',
		xsollaIdentifierEnvKeyBase: 'XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID',
	},
	duration_3_months: {
		id: 'duration_3_months',
		kind: 'one_time_item',
		durationMonths: 3,
		displayName: '3-month duration pass',
		xsollaIdentifierEnvKeyBase: 'XSOLLA_DURATION_3_MONTHS_SKU',
	},
	duration_12_months: {
		id: 'duration_12_months',
		kind: 'one_time_item',
		durationMonths: 12,
		displayName: '12-month duration pass',
		xsollaIdentifierEnvKeyBase: 'XSOLLA_DURATION_12_MONTHS_SKU',
	},
};

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
	const nestedSubPath = pathSegments[5] || '';
	const extraSegments = pathSegments.length > 6;

	if (!uid || uid === 'purchase') {
		return { ok: false, status: 400, error: 'Missing UID' };
	}

	if (extraSegments) {
		return { ok: false, status: 404, error: 'Unknown API path' };
	}

	const isAllowedDirectSubPath = ['purchase', 'cancel', 'daily-routine-claim'].includes(subPath);
	const isAllowedNestedSubPath = subPath === 'xsolla' && nestedSubPath === 'checkout-token';

	if (subPath && !isAllowedDirectSubPath && !isAllowedNestedSubPath) {
		return { ok: false, status: 404, error: 'Unknown API path' };
	}

	if (subPath === 'xsolla' && !nestedSubPath) {
		return { ok: false, status: 404, error: 'Unknown API path' };
	}

	return { ok: true, uid, subPath, nestedSubPath };
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

	if (request.method === 'GET' && (routeInfo.subPath || routeInfo.nestedSubPath)) {
		return { ok: false, status: 405, error: 'Method Not Allowed', headers: { Allow: 'POST, OPTIONS' } };
	}

	if (request.method === 'POST') {
		const requiresJsonBody =
			!routeInfo.subPath ||
			routeInfo.subPath === 'purchase' ||
			routeInfo.subPath === 'daily-routine-claim' ||
			(routeInfo.subPath === 'xsolla' && routeInfo.nestedSubPath === 'checkout-token');
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

const jsonResponse = (corsHeaders, body, status = 200, extraHeaders = {}) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
	});

const getXsollaEnvironmentName = (env) => {
	const requestedEnv = String(env.XSOLLA_ENV || 'sandbox').trim().toLowerCase();
	return XSOLLA_ENVIRONMENTS[requestedEnv] ? requestedEnv : 'sandbox';
};

const getXsollaScopedEnvValue = (env, baseKey) => {
	const environmentName = getXsollaEnvironmentName(env);
	const scopedKey = `${baseKey}_${environmentName.toUpperCase()}`;
	return env[scopedKey] || env[baseKey] || null;
};

const getXsollaBaseConfig = (env) => ({
	merchantId: getXsollaScopedEnvValue(env, 'XSOLLA_MERCHANT_ID'),
	projectId: getXsollaScopedEnvValue(env, 'XSOLLA_PROJECT_ID'),
	apiKey: getXsollaScopedEnvValue(env, 'XSOLLA_API_KEY'),
});

const getXsollaProductIdentifier = (env, product) =>
	(product ? getXsollaScopedEnvValue(env, product.xsollaIdentifierEnvKeyBase) : null);

const getXsollaConfigStatus = (env) => {
	const xsollaBaseConfig = getXsollaBaseConfig(env);
	const missingBaseEnv = [];
	if (!xsollaBaseConfig.merchantId) missingBaseEnv.push('XSOLLA_MERCHANT_ID[_SANDBOX|_PRODUCTION]');
	if (!xsollaBaseConfig.projectId) missingBaseEnv.push('XSOLLA_PROJECT_ID[_SANDBOX|_PRODUCTION]');
	if (!xsollaBaseConfig.apiKey) missingBaseEnv.push('XSOLLA_API_KEY[_SANDBOX|_PRODUCTION]');

	const missingProductEnv = [];
	for (const product of Object.values(XSOLLA_PRODUCTS)) {
		if (!getXsollaProductIdentifier(env, product)) {
			missingProductEnv.push(`${product.xsollaIdentifierEnvKeyBase}[_SANDBOX|_PRODUCTION]`);
		}
	}

	return {
		missingBaseEnv,
		missingProductEnv,
		ready: missingBaseEnv.length === 0 && missingProductEnv.length === 0,
	};
};

const getXsollaEnvironmentConfig = (env) => {
	return XSOLLA_ENVIRONMENTS[getXsollaEnvironmentName(env)];
};

const getXsollaWebhookSecret = (env) => {
	const environmentName = getXsollaEnvironmentName(env);
	if (environmentName === 'production') {
		return env.XSOLLA_WEBHOOK_SECRET_PRODUCTION || env.XSOLLA_WEBHOOK_SECRET || null;
	}

	return env.XSOLLA_WEBHOOK_SECRET_SANDBOX || env.XSOLLA_WEBHOOK_SECRET || null;
};

const buildXsollaCheckoutUrl = (token, xsollaEnvironment) =>
	`${xsollaEnvironment.checkoutBaseUrl}?token=${encodeURIComponent(token)}`;

const buildXsollaReturnUrl = (env, allowedOrigin) => {
	const environmentName = getXsollaEnvironmentName(env);
	const scopedReturnUrl = getXsollaScopedEnvValue(env, 'XSOLLA_RETURN_URL');
	if (environmentName === 'sandbox' && allowedOrigin) {
		return new URL(XSOLLA_RETURN_PATH, `${allowedOrigin}/`).toString();
	}

	if (scopedReturnUrl) {
		return scopedReturnUrl;
	}

	if (allowedOrigin) {
		return new URL(XSOLLA_RETURN_PATH, `${allowedOrigin}/`).toString();
	}

	return DEFAULT_XSOLLA_RETURN_URL;
};

const encodeBasicAuth = (left, right) => btoa(`${left}:${right}`);

const toTwoLetterLanguage = (value) => {
	const trimmed = String(value || '').trim();
	if (!trimmed) return 'en';
	const [language] = trimmed.split(/[-_]/);
	return language ? language.toLowerCase() : 'en';
};

const normalizeCountryCode = (value) => {
	const normalized = String(value || '').trim().toUpperCase();
	return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
};

const DEVELOPED_COUNTRY_CODES = new Set(['US', 'GB', 'ES', 'PT', 'FR', 'KR', 'JP']);
const DEVELOPING_COUNTRY_CODES = new Set(['VN', 'ID']);
const DEVELOPING_FALLBACK_LANGUAGES = new Set(['vi', 'id']);

const resolveBillingMarketSegment = (countryCode, languageCode) => {
	const normalizedCountryCode = normalizeCountryCode(countryCode);
	const normalizedLanguageCode = toTwoLetterLanguage(languageCode);

	if (normalizedCountryCode && DEVELOPING_COUNTRY_CODES.has(normalizedCountryCode)) {
		return 'developing';
	}

	if (normalizedCountryCode && DEVELOPED_COUNTRY_CODES.has(normalizedCountryCode)) {
		return 'developed';
	}

	if (DEVELOPING_FALLBACK_LANGUAGES.has(normalizedLanguageCode)) {
		return 'developing';
	}

	return 'developed';
};

const resolveExpectedBillingProductId = (durationMonths, countryCode, languageCode) => {
	const marketSegment = resolveBillingMarketSegment(countryCode, languageCode);
	if (marketSegment === 'developing') {
		return durationMonths === 12 ? 'duration_12_months' : 'duration_3_months';
	}

	return durationMonths === 12 ? 'subscription_12_months' : 'subscription_3_months';
};

const parseXsollaError = async (response) => {
	try {
		const text = await response.text();
		if (!text) {
			return {
				status: response.status,
				body: null,
				message: 'Xsolla request failed',
			};
		}

		try {
			const json = JSON.parse(text);
			return {
				status: response.status,
				body: json,
				message: json?.errorMessage || json?.message || json?.error || text || 'Xsolla request failed',
			};
		} catch {
			return {
				status: response.status,
				body: null,
				message: text || 'Xsolla request failed',
			};
		}
	} catch {
		return {
			status: response.status,
			body: null,
			message: 'Xsolla request failed',
		};
	}
};

const toSha1Hex = async (input) => {
	const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
};

const getXsollaSignature = (request) => {
	const authorization = request.headers.get('authorization') || request.headers.get('Authorization') || '';
	const match = authorization.match(/^Signature\s+([a-fA-F0-9]+)$/);
	return match ? match[1].toLowerCase() : null;
};

const constantTimeEqualHex = (left, right) => {
	if (typeof left !== 'string' || typeof right !== 'string') {
		return false;
	}

	if (left.length !== right.length) {
		return false;
	}

	let diff = 0;
	for (let i = 0; i < left.length; i += 1) {
		diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
	}

	return diff === 0;
};

const verifyXsollaWebhookSignature = async (request, rawBody, secret) => {
	const providedSignature = getXsollaSignature(request);
	if (!providedSignature) {
		return { ok: false, reason: 'MISSING_SIGNATURE' };
	}

	const expectedSignature = await toSha1Hex(`${rawBody}${secret}`);
	if (!constantTimeEqualHex(providedSignature, expectedSignature)) {
		return { ok: false, reason: 'INVALID_SIGNATURE' };
	}

	return { ok: true };
};

const addDurationMonths = (timestampMs, months) => {
	const date = new Date(timestampMs);
	date.setUTCMonth(date.getUTCMonth() + months);
	return date.getTime();
};

const parseIsoTimestamp = (value) => {
	if (!value) return null;
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : null;
};

const joinProductIds = (productIds) => {
	const unique = Array.from(new Set((productIds || []).filter(Boolean)));
	return unique.length > 0 ? unique.sort().join(',') : null;
};

const getXsollaProductByIdentifier = (env, identifier) => {
	if (!identifier) return null;
	return Object.values(XSOLLA_PRODUCTS).find((product) => getXsollaProductIdentifier(env, product) === identifier) || null;
};

const isXsollaRecurringPlan = (plan) =>
	typeof plan === 'string' && plan.startsWith('subscription_');

const isXsollaDurationPlan = (plan) =>
	typeof plan === 'string' && plan.startsWith('duration_');

const getXsollaProductById = (productId) =>
	(productId && XSOLLA_PRODUCTS[productId]) || null;

const getXsollaProductIdentifierByPlan = (env, plan) => {
	const product = getXsollaProductById(plan);
	return getXsollaProductIdentifier(env, product);
};

const isValidXsollaSubscriptionId = (value) =>
	Number.isInteger(value) && value > 0;

const isValidXsollaTransactionId = (value) =>
	Number.isInteger(value) && value > 0;

const isActiveEntitlementStatus = (status) =>
	status === 'active' || status === 'non_renewing';

const clearEntitlement = async (env, uid, now) => {
	await env.DB.prepare(`
		INSERT INTO users (
			uid, entitlement_status, entitlement_kind, entitlement_plan, entitlement_end,
			billing_provider, billing_reference_id, billing_reference_type, created_at, last_synced_at
		)
		VALUES (?, 'inactive', NULL, NULL, 0, NULL, NULL, NULL, ?, ?)
		ON CONFLICT(uid) DO UPDATE SET
			entitlement_status = 'inactive',
			entitlement_kind = NULL,
			entitlement_plan = NULL,
			entitlement_end = 0,
			billing_provider = NULL,
			billing_reference_id = NULL,
			billing_reference_type = NULL,
			last_synced_at = excluded.last_synced_at
	`).bind(uid, now, now).run();
};

const upsertEntitlement = async (
	env,
	uid,
	{
		status,
		kind,
		plan,
		endTimestampMs,
		billingReferenceId = null,
		billingReferenceType = null,
	},
	now
) => {
	await env.DB.prepare(`
		INSERT INTO users (
			uid, entitlement_status, entitlement_kind, entitlement_plan, entitlement_end,
			billing_provider, billing_reference_id, billing_reference_type, created_at, last_synced_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(uid) DO UPDATE SET
			entitlement_status = excluded.entitlement_status,
			entitlement_kind = excluded.entitlement_kind,
			entitlement_plan = excluded.entitlement_plan,
			entitlement_end = excluded.entitlement_end,
			billing_provider = excluded.billing_provider,
			billing_reference_id = excluded.billing_reference_id,
			billing_reference_type = excluded.billing_reference_type,
			last_synced_at = excluded.last_synced_at
	`).bind(
		uid,
		status,
		kind,
		plan,
		endTimestampMs,
		plan ? 'xsolla' : null,
		billingReferenceId,
		billingReferenceType,
		now,
		now
	).run();
};

const createXsollaAuthHeaders = (env) => {
	const xsollaBaseConfig = getXsollaBaseConfig(env);
	return {
		'Authorization': `Basic ${encodeBasicAuth(xsollaBaseConfig.merchantId, xsollaBaseConfig.apiKey)}`,
		'Content-Type': 'application/json',
	};
};

const requestXsollaSubscriptionCancellation = async (env, userId, currentPlan, subscriptionId) => {
	if (!isValidXsollaSubscriptionId(subscriptionId)) {
		return {
			ok: false,
			status: 409,
			body: {
				error: 'Xsolla subscription tracking is missing for this account. Sync the subscription from a verified webhook before allowing in-service cancellation.',
				entitlementPlan: currentPlan || null,
			},
		};
	}

	const response = await fetch(
		XSOLLA_UPDATE_SUBSCRIPTION_URL(getXsollaBaseConfig(env).projectId, userId, subscriptionId),
		{
			method: 'PUT',
			headers: createXsollaAuthHeaders(env),
			body: JSON.stringify({ status: 'non_renewing' }),
		}
	);

	if (!response.ok) {
		throw await parseXsollaError(response);
	}

	const payload = await response.json().catch(() => null);
	return {
		ok: true,
		subscriptionId,
		payload,
	};
};

const requestXsollaRefund = async (env, transactionId, email = null) => {
	if (!isValidXsollaTransactionId(transactionId)) {
		return {
			ok: false,
			status: 409,
			body: {
				error: 'Refund transaction ID is missing for this pass.',
			},
		};
	}

	const payload = {
		description: 'User requested pass cancellation refund.',
	};
	if (email) {
		payload.email = email;
	}

	const response = await fetch(
		XSOLLA_REFUND_URL(getXsollaBaseConfig(env).merchantId, transactionId),
		{
			method: 'PUT',
			headers: createXsollaAuthHeaders(env),
			body: JSON.stringify(payload),
		}
	);

	if (!response.ok) {
		throw await parseXsollaError(response);
	}

	const body = await response.json().catch(() => null);
	return {
		ok: true,
		transactionId,
		payload: body,
	};
};

const applySubscriptionGrant = async (env, uid, product, endTimestampMs, now, xsollaSubscriptionId = null) => {
	const subscriptionEnd = Number.isFinite(endTimestampMs) ? endTimestampMs : addDurationMonths(now, product.durationMonths);
	await upsertEntitlement(env, uid, {
		status: 'active',
		kind: 'subscription',
		plan: product.id,
		endTimestampMs: subscriptionEnd,
		billingReferenceId: isValidXsollaSubscriptionId(xsollaSubscriptionId) ? String(xsollaSubscriptionId) : null,
		billingReferenceType: isValidXsollaSubscriptionId(xsollaSubscriptionId) ? 'subscription_id' : null,
	}, now);
};

const applyDurationItemGrant = async (env, uid, product, baseTimestampMs, now, xsollaTransactionId = null) => {
	const current = await env.DB.prepare('SELECT entitlement_kind, entitlement_end FROM users WHERE uid = ?').bind(uid).first();
	const startAt = current?.entitlement_kind === 'duration' && current?.entitlement_end > baseTimestampMs
		? current.entitlement_end
		: baseTimestampMs;
	const entitlementEnd = addDurationMonths(startAt, product.durationMonths);
	await upsertEntitlement(env, uid, {
		status: 'active',
		kind: 'duration',
		plan: product.id,
		endTimestampMs: entitlementEnd,
		billingReferenceId: isValidXsollaTransactionId(xsollaTransactionId) ? String(xsollaTransactionId) : null,
		billingReferenceType: isValidXsollaTransactionId(xsollaTransactionId) ? 'transaction_id' : null,
	}, now);
};

const applySubscriptionCancellation = async (env, uid, product, dateEndMs, now, xsollaSubscriptionId = null) => {
	const stillActive = Number.isFinite(dateEndMs) && dateEndMs > now;
	if (!stillActive) {
		await clearEntitlement(env, uid, now);
		return;
	}

	await upsertEntitlement(env, uid, {
		status: 'non_renewing',
		kind: 'subscription',
		plan: product?.id || null,
		endTimestampMs: dateEndMs,
		billingReferenceId: isValidXsollaSubscriptionId(xsollaSubscriptionId) ? String(xsollaSubscriptionId) : null,
		billingReferenceType: isValidXsollaSubscriptionId(xsollaSubscriptionId) ? 'subscription_id' : null,
	}, now);
};

const applySubscriptionNonRenewal = async (env, uid, product, dateEndMs, now, xsollaSubscriptionId = null) => {
	const activeUntil = Number.isFinite(dateEndMs) ? dateEndMs : 0;
	const stillActive = activeUntil > now;
	if (!stillActive) {
		await clearEntitlement(env, uid, now);
		return;
	}

	await upsertEntitlement(env, uid, {
		status: 'non_renewing',
		kind: 'subscription',
		plan: product?.id || null,
		endTimestampMs: activeUntil,
		billingReferenceId: isValidXsollaSubscriptionId(xsollaSubscriptionId) ? String(xsollaSubscriptionId) : null,
		billingReferenceType: isValidXsollaSubscriptionId(xsollaSubscriptionId) ? 'subscription_id' : null,
	}, now);
};

const revokeDurationAccess = async (env, uid, xsollaTransactionId, now) => {
	if (!isValidXsollaTransactionId(xsollaTransactionId)) {
		return false;
	}

	const current = await env.DB.prepare(`
		SELECT entitlement_kind, billing_reference_type, billing_reference_id
		FROM users
		WHERE uid = ?
	`).bind(uid).first();

	if (
		current?.entitlement_kind !== 'duration' ||
		current?.billing_reference_type !== 'transaction_id' ||
		current?.billing_reference_id !== String(xsollaTransactionId)
	) {
		return false;
	}

	await clearEntitlement(env, uid, now);
	return true;
};

const extractOrderPaidSkus = (payload) => {
	const items = Array.isArray(payload?.items) ? payload.items : [];
	return items
		.map((item) => item?.sku || item?.item?.sku || item?.virtual_item?.sku || null)
		.filter(Boolean);
};

const extractXsollaTransactionId = (payload) => {
	const candidates = [
		payload?.order?.invoice_id,
		payload?.transaction?.id,
		payload?.transaction?.transaction_id,
		payload?.invoice?.id,
	];
	for (const candidate of candidates) {
		const parsed = Number(candidate);
		if (isValidXsollaTransactionId(parsed)) {
			return parsed;
		}
	}
	return null;
};

const buildXsollaWebhookEventContext = (env, payload) => {
	const notificationType = payload?.notification_type || 'unknown';
	const uid =
		payload?.user?.id ||
		payload?.user?.user_id ||
		payload?.user?.external_id ||
		payload?.user?.externalId ||
		payload?.user_id ||
		payload?.external_id ||
		payload?.externalId ||
		payload?.custom_parameters?.uid ||
		payload?.custom_parameters?.user_id ||
		payload?.custom_parameters?.external_id ||
		null;
	const subscriptionPlanId = payload?.subscription?.plan_id || null;
	const subscriptionProduct = getXsollaProductByIdentifier(env, subscriptionPlanId);
	const subscriptionId = Number(payload?.subscription?.subscription_id);
	const transactionId = extractXsollaTransactionId(payload);
	const durationProducts = extractOrderPaidSkus(payload)
		.map((sku) => getXsollaProductByIdentifier(env, sku))
		.filter((product) => product?.kind === 'one_time_item');
	const productId = subscriptionProduct?.id || joinProductIds(durationProducts.map((product) => product.id));

	let eventKeyParts;
	if (isValidXsollaSubscriptionId(subscriptionId)) {
		eventKeyParts = [
			notificationType,
			'subscription',
			String(subscriptionId),
			payload?.subscription?.date_next_charge || '',
			payload?.subscription?.date_end || '',
		];
	} else if (isValidXsollaTransactionId(transactionId)) {
		eventKeyParts = [
			notificationType,
			'transaction',
			String(transactionId),
			productId || '',
		];
	} else {
		eventKeyParts = [
			notificationType,
			uid || '',
			subscriptionPlanId || '',
			productId || '',
			payload?.subscription?.date_next_charge || '',
			payload?.subscription?.date_end || '',
		];
	}

	return {
		eventKey: eventKeyParts.join('::'),
		notificationType,
		uid,
		productId,
		xsollaTransactionId: isValidXsollaTransactionId(transactionId) ? transactionId : null,
		xsollaSubscriptionId: isValidXsollaSubscriptionId(subscriptionId) ? subscriptionId : null,
		durationProducts,
	};
};

const claimXsollaWebhookEvent = async (env, eventContext, now) => {
	const insertResult = await env.DB.prepare(`
		INSERT OR IGNORE INTO xsolla_webhook_events (
			event_key, notification_type, uid, product_id, xsolla_transaction_id, xsolla_subscription_id, processing_status, processed_at
		)
		VALUES (?, ?, ?, ?, ?, ?, 'processing', ?)
	`).bind(
		eventContext.eventKey,
		eventContext.notificationType,
		eventContext.uid,
		eventContext.productId,
		eventContext.xsollaTransactionId,
		eventContext.xsollaSubscriptionId,
		now
	).run();

	if ((insertResult.meta?.changes || 0) > 0) {
		return { claimed: true };
	}

	const existing = await env.DB.prepare(`
		SELECT processing_status
		FROM xsolla_webhook_events
		WHERE event_key = ?
	`).bind(eventContext.eventKey).first();

	if (existing?.processing_status === 'failed') {
		const retryResult = await env.DB.prepare(`
			UPDATE xsolla_webhook_events
			SET
				notification_type = ?,
				uid = ?,
				product_id = ?,
				xsolla_transaction_id = ?,
				xsolla_subscription_id = ?,
				processing_status = 'processing',
				processed_at = ?
			WHERE event_key = ? AND processing_status = 'failed'
		`).bind(
			eventContext.notificationType,
			eventContext.uid,
			eventContext.productId,
			eventContext.xsollaTransactionId,
			eventContext.xsollaSubscriptionId,
			now,
			eventContext.eventKey
		).run();

		if ((retryResult.meta?.changes || 0) > 0) {
			return { claimed: true };
		}
	}

	return { claimed: false };
};

const finalizeXsollaWebhookEvent = async (env, eventKey, processingStatus, now) => {
	await env.DB.prepare(`
		UPDATE xsolla_webhook_events
		SET processing_status = ?, processed_at = ?
		WHERE event_key = ?
	`).bind(processingStatus, now, eventKey).run();
};

const processXsollaWebhook = async (env, payload, now) => {
	const eventContext = buildXsollaWebhookEventContext(env, payload);
	const notificationType = eventContext.notificationType;

	if (notificationType === 'user_validation') {
		return { status: 204 };
	}

	const claimResult = await claimXsollaWebhookEvent(env, eventContext, now);
	if (!claimResult.claimed) {
		return { status: 204 };
	}

	try {
		if (notificationType === 'create_subscription' || notificationType === 'update_subscription') {
			const uid = payload?.user?.id;
		const planId = payload?.subscription?.plan_id;
		const product = getXsollaProductByIdentifier(env, planId);
		if (!uid || !product) {
				await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'failed', now);
				return { status: 400, body: { error: 'Unknown subscription webhook payload' } };
		}

		const endTimestampMs =
			parseIsoTimestamp(payload?.subscription?.date_next_charge) ||
			parseIsoTimestamp(payload?.subscription?.date_end) ||
			null;
		await applySubscriptionGrant(
			env,
			uid,
			product,
			endTimestampMs,
			now,
			eventContext.xsollaSubscriptionId
		);
			await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'processed', now);
		return { status: 204 };
	}

	if (notificationType === 'cancel_subscription') {
		const uid = payload?.user?.id;
		const planId = payload?.subscription?.plan_id;
		const product = getXsollaProductByIdentifier(env, planId);
		if (!uid) {
			await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'failed', now);
			return { status: 400, body: { error: 'Missing user id' } };
		}
		const dateEndMs = parseIsoTimestamp(payload?.subscription?.date_end);
		await applySubscriptionCancellation(
			env,
			uid,
			product,
			dateEndMs,
			now,
			eventContext.xsollaSubscriptionId
		);
		await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'processed', now);
		return { status: 204 };
	}

	if (notificationType === 'non_renewal_subscription') {
		const uid = payload?.user?.id;
		const planId = payload?.subscription?.plan_id;
		const product = getXsollaProductByIdentifier(env, planId);
		if (!uid) {
			await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'failed', now);
			return { status: 400, body: { error: 'Missing user id' } };
		}
		const dateEndMs =
			parseIsoTimestamp(payload?.subscription?.date_end) ||
			parseIsoTimestamp(payload?.subscription?.date_next_charge) ||
			null;
		await applySubscriptionNonRenewal(
			env,
			uid,
			product,
			dateEndMs,
			now,
			eventContext.xsollaSubscriptionId
		);
		await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'processed', now);
		return { status: 204 };
	}

	if (notificationType === 'order_paid') {
		const uid = eventContext.uid;
		if (!uid) {
			await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'failed', now);
			return { status: 400, body: { error: 'Missing user id' } };
		}

		const durationProducts = eventContext.durationProducts;
		if (durationProducts.length === 0) {
			await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'processed', now);
			return { status: 204 };
		}

		const paymentDateMs = parseIsoTimestamp(payload?.transaction?.payment_date) || now;
		for (const product of durationProducts) {
			await applyDurationItemGrant(
				env,
				uid,
				product,
				paymentDateMs,
				now,
				eventContext.xsollaTransactionId
			);
		}
		await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'processed', now);
		return { status: 204 };
	}

	if (notificationType === 'order_canceled' || notificationType === 'refund') {
		const uid = eventContext.uid;
		const revokedDurationProducts = eventContext.durationProducts;

		if (uid && revokedDurationProducts.length > 0) {
			await revokeDurationAccess(env, uid, eventContext.xsollaTransactionId, now);
		}
		await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'processed', now);
		return { status: 204 };
	}

	if (notificationType === 'payment') {
		// Processed later with transaction history/idempotency support.
		await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'processed', now);
		return { status: 204 };
	}

	await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'processed', now);
	return { status: 204 };
	} catch (error) {
		await finalizeXsollaWebhookEvent(env, eventContext.eventKey, 'failed', now);
		throw error;
	}
};

const createXsollaSubscriptionToken = async ({
	env,
	xsollaEnvironment,
	product,
	productIdentifier,
	userId,
	email,
	name,
	countryCode,
	language,
	returnUrl,
}) => {
	const xsollaBaseConfig = getXsollaBaseConfig(env);
	const body = {
		user: {
			id: { value: userId },
		},
		settings: {
			project_id: Number(xsollaBaseConfig.projectId),
			language,
			currency: 'USD',
			mode: xsollaEnvironment.subscriptionMode,
			return_url: returnUrl,
		},
		purchase: {
			subscription: {
				plan_id: productIdentifier,
				currency: 'USD',
			},
		},
	};

	if (email) {
		body.user.email = { value: email, allow_modify: false };
	}

	if (name) {
		body.user.name = { value: name, allow_modify: false };
	}

	if (countryCode) {
		body.user.country = { value: countryCode, allow_modify: true };
	}

	const response = await fetch(XSOLLA_SUBSCRIPTION_TOKEN_URL(xsollaBaseConfig.merchantId), {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${encodeBasicAuth(xsollaBaseConfig.merchantId, xsollaBaseConfig.apiKey)}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw await parseXsollaError(response);
	}

	return response.json();
};

const createXsollaCatalogToken = async ({
	env,
	xsollaEnvironment,
	product,
	productIdentifier,
	userId,
	email,
	name,
	countryCode,
	language,
	returnUrl,
	clientIp,
}) => {
	const xsollaBaseConfig = getXsollaBaseConfig(env);
	const body = {
		sandbox: xsollaEnvironment.catalogSandbox,
		user: {
			id: { value: userId },
		},
		purchase: {
			items: [
				{ sku: productIdentifier, quantity: 1 },
			],
		},
		settings: {
			language,
			currency: 'USD',
			return_url: returnUrl,
		},
	};

	if (email) {
		body.user.email = { value: email };
	}

	if (name) {
		body.user.name = { value: name };
	}

	if (countryCode) {
		body.user.country = { value: countryCode };
	}

	const headers = {
		'Authorization': `Basic ${encodeBasicAuth(xsollaBaseConfig.projectId, xsollaBaseConfig.apiKey)}`,
		'Content-Type': 'application/json',
	};
	if (!countryCode && clientIp && clientIp !== 'unknown') {
		headers['X-User-Ip'] = clientIp;
	}

	const response = await fetch(XSOLLA_CATALOG_TOKEN_URL(xsollaBaseConfig.projectId), {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw await parseXsollaError(response);
	}

	return response.json();
};

const handleXsollaCheckoutTokenRequest = async (request, env, corsHeaders, uid, clientIp, allowedOrigin) => {
	const body = await request.json();
	const { productId, countryCode, languageCode } = body || {};
	const product = XSOLLA_PRODUCTS[productId];

	if (!product) {
		return jsonResponse(corsHeaders, { error: 'Invalid productId' }, 400);
	}

	const configStatus = getXsollaConfigStatus(env);
	if (configStatus.missingBaseEnv.length > 0) {
		return jsonResponse(corsHeaders, {
			error: 'Xsolla base configuration incomplete',
			missing: configStatus.missingBaseEnv,
		}, 503);
	}

	const productIdentifier = getXsollaProductIdentifier(env, product);
	if (!productIdentifier) {
		return jsonResponse(corsHeaders, {
			error: 'Xsolla product mapping incomplete',
			missing: [`${product.xsollaIdentifierEnvKeyBase}[_SANDBOX|_PRODUCTION]`],
			productId,
		}, 503);
	}
	const normalizedCountryCode = normalizeCountryCode(countryCode);
	const normalizedLanguage = toTwoLetterLanguage(languageCode);
	const expectedProductId = resolveExpectedBillingProductId(
		product.durationMonths,
		normalizedCountryCode,
		normalizedLanguage
	);

	if (productId !== expectedProductId) {
		return jsonResponse(corsHeaders, {
			error: 'Requested product does not match the current billing market',
			productId,
			expectedProductId,
			countryCode: normalizedCountryCode,
			languageCode: normalizedLanguage,
		}, 400);
	}

	const returnUrl = buildXsollaReturnUrl(env, allowedOrigin);
	const xsollaEnvironment = getXsollaEnvironmentConfig(env);
	const storedUser = await env.DB.prepare(
		'SELECT email, display_name FROM users WHERE uid = ?'
	).bind(uid).first();
	const trustedEmail = typeof storedUser?.email === 'string' && storedUser.email.trim()
		? storedUser.email.trim()
		: null;
	const trustedName = typeof storedUser?.display_name === 'string' && storedUser.display_name.trim()
		? storedUser.display_name.trim()
		: null;

	try {
		const tokenResponse = product.kind === 'regular_subscription'
			? await createXsollaSubscriptionToken({
				env,
				xsollaEnvironment,
				product,
				productIdentifier,
				userId: uid,
				email: trustedEmail,
				name: trustedName,
				countryCode: normalizedCountryCode,
				language: normalizedLanguage,
				returnUrl,
			})
			: await createXsollaCatalogToken({
				env,
				xsollaEnvironment,
				product,
				productIdentifier,
				userId: uid,
				email: trustedEmail,
				name: trustedName,
				countryCode: normalizedCountryCode,
				language: normalizedLanguage,
				returnUrl,
				clientIp,
			});

		return jsonResponse(corsHeaders, {
			success: true,
			productId,
			token: tokenResponse.token,
			orderId: tokenResponse.order_id || null,
			checkoutUrl: buildXsollaCheckoutUrl(tokenResponse.token, xsollaEnvironment),
			sandbox: xsollaEnvironment.catalogSandbox,
			identifierType: product.kind === 'regular_subscription' ? 'plan_id' : 'sku',
		});
	} catch (error) {
		return jsonResponse(corsHeaders, {
			error: 'Xsolla checkout token request failed',
			productId,
			details: error?.body || error?.message || error,
			status: error?.status || 500,
		}, error?.status || 500);
	}
};

const handleXsollaWebhookRequest = async (request, env, corsHeaders, clientIp, requestId, now) => {
	if (request.method !== 'POST') {
		return jsonResponse(corsHeaders, { error: 'Method Not Allowed' }, 405, { Allow: 'POST, OPTIONS' });
	}

	const webhookSecret = getXsollaWebhookSecret(env);

	const bodySize = getBodySize(request);
	if (bodySize !== null && bodySize > XSOLLA_WEBHOOK_MAX_BODY_BYTES) {
		logSecurityEvent('request_shape_rejected', {
			requestId,
			ip: clientIp,
			path: XSOLLA_WEBHOOK_PATH,
			method: request.method,
			reason: 'Xsolla webhook body too large',
			bodySize,
		});
		return jsonResponse(corsHeaders, { error: 'Webhook body too large' }, 413);
	}

	const webhookRules = RATE_LIMIT_RULES.webhook;
	if (webhookRules?.preAuth?.length) {
		const rateLimitResult = await enforceRateLimitRules(
			env.DB,
			`webhook:${clientIp}`,
			now,
			webhookRules.preAuth
		);
		if (!rateLimitResult.ok) {
			logSecurityEvent('rate_limit_hit', {
				requestId,
				stage: 'webhook',
				ip: clientIp,
				path: XSOLLA_WEBHOOK_PATH,
				method: request.method,
				retryAfterMs: rateLimitResult.retryAfterMs,
			});
			return createRateLimitResponse(corsHeaders, 'webhook_rate_limit', rateLimitResult.retryAfterMs);
		}
	}

	if (!webhookSecret) {
		return jsonResponse(corsHeaders, {
			error: 'Xsolla webhook secret not configured',
			missing: ['XSOLLA_WEBHOOK_SECRET_SANDBOX|XSOLLA_WEBHOOK_SECRET_PRODUCTION|XSOLLA_WEBHOOK_SECRET'],
		}, 503);
	}

	const rawBody = await request.text();
	if (new TextEncoder().encode(rawBody).byteLength > XSOLLA_WEBHOOK_MAX_BODY_BYTES) {
		logSecurityEvent('request_shape_rejected', {
			requestId,
			ip: clientIp,
			path: XSOLLA_WEBHOOK_PATH,
			method: request.method,
			reason: 'Xsolla webhook body too large',
		});
		return jsonResponse(corsHeaders, { error: 'Webhook body too large' }, 413);
	}
	const signatureCheck = await verifyXsollaWebhookSignature(request, rawBody, webhookSecret);
	if (!signatureCheck.ok) {
		return jsonResponse(corsHeaders, {
			error: signatureCheck.reason,
		}, 401);
	}

	let payload;
	try {
		payload = JSON.parse(rawBody);
	} catch {
		return jsonResponse(corsHeaders, { error: 'INVALID_JSON' }, 400);
	}

	const result = await processXsollaWebhook(env, payload, Date.now());
	if (result.status === 204) {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	return jsonResponse(corsHeaders, result.body || { error: 'Webhook processing failed' }, result.status || 500);
};

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;
		const now = Date.now();
		const requestId = getRequestId(request);
		const rawClientIp = getClientIp(request);
		const clientIp = normalizeRouteSegment(rawClientIp);

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

		if (path === XSOLLA_WEBHOOK_PATH) {
			return handleXsollaWebhookRequest(request, env, corsHeaders, clientIp, requestId, now);
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

					if (
						isActiveEntitlementStatus(result.entitlement_status) &&
						result.entitlement_end &&
						result.entitlement_end < now
					) {
						await clearEntitlement(env, uid, now);
						result.entitlement_status = 'inactive';
						result.entitlement_kind = null;
						result.entitlement_plan = null;
						result.entitlement_end = 0;
						result.billing_provider = null;
						result.billing_reference_id = null;
						result.billing_reference_type = null;
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
				if (routeInfo.subPath === 'xsolla' && routeInfo.nestedSubPath === 'checkout-token') {
					try {
						return await handleXsollaCheckoutTokenRequest(
							request,
							env,
							corsHeaders,
							uid,
							rawClientIp,
							corsContext.allowedOrigin
						);
					} catch (err) {
						return jsonResponse(corsHeaders, { error: err.message }, 500);
					}
				}

				// Cancel Subscription Endpoint
				if (path.endsWith('/cancel')) {
					try {
						const currentSubscription = await env.DB.prepare(
							'SELECT email, entitlement_plan, entitlement_kind, billing_reference_id, billing_reference_type FROM users WHERE uid = ?'
						).bind(uid).first();
						const currentPlan = currentSubscription?.entitlement_plan || null;
						const currentKind = currentSubscription?.entitlement_kind || null;
						const billingReferenceType = currentSubscription?.billing_reference_type || null;
						const xsollaSubscriptionId = Number(currentSubscription?.billing_reference_id);
						if (isXsollaRecurringPlan(currentPlan)) {
							const configStatus = getXsollaConfigStatus(env);
							if (configStatus.missingBaseEnv.length > 0) {
								return jsonResponse(corsHeaders, {
									error: 'Xsolla base configuration incomplete',
									missing: configStatus.missingBaseEnv,
								}, 503);
							}

							const cancellation = await requestXsollaSubscriptionCancellation(
								env,
								uid,
								currentPlan,
								billingReferenceType === 'subscription_id' && isValidXsollaSubscriptionId(xsollaSubscriptionId)
									? xsollaSubscriptionId
									: null
							);
							if (!cancellation.ok) {
								return jsonResponse(corsHeaders, cancellation.body, cancellation.status);
							}

							return jsonResponse(corsHeaders, {
								success: true,
								mode: 'xsolla',
								subscriptionId: cancellation.subscriptionId,
								status: cancellation.payload?.status || 'non_renewing',
							});
						}

						if (currentKind === 'duration' && isXsollaDurationPlan(currentPlan)) {
							return jsonResponse(corsHeaders, {
								error: 'Duration pass refunds are not enabled in-service yet.',
								entitlementPlan: currentPlan,
							}, 409);
						}

						return jsonResponse(corsHeaders, {
							error: 'No active Xsolla-managed subscription found for this account.',
						}, 409);
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
