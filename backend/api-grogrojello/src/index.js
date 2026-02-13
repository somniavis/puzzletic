/**
 * Cloudflare Worker for Grogrojello
 * Handles sync between Client and D1 Database
 */

const FIREBASE_DEFAULT_PROJECT_ID = 'grogro-jello-4a53a';
const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let firebaseJwksCache = null;
let firebaseJwksExpiry = 0;

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

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		// CORS Headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
		};

		// Handle OPTIONS (CORS preflight)
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Router
		if (path.startsWith('/api/users/')) {
			// Fix: Extract UID from correct path segment (index 3)
			// Path: /api/users/:uid or /api/users/:uid/purchase
			// Split: ['', 'api', 'users', 'uid', 'purchase']
			const pathSegments = path.split('/');
			const uid = pathSegments[3]; // Always the UID
			if (!uid || uid === 'purchase') return new Response('Missing UID', { status: 400, headers: corsHeaders });

			const authResult = await authenticateRequest(request, env, uid);
			if (!authResult.ok) {
				return new Response(JSON.stringify({ error: authResult.error }), {
					status: authResult.status,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
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
					const now = Date.now();
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

						const now = Date.now();
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
						const now = Date.now();
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

				// --- Normal Sync Logic (POST /api/users/:uid) ---
				try {
					const body = await request.json();
					// Accept both snake_case (new) and camelCase (legacy) field names
					const email = body.email;
					const displayName = body.display_name || body.displayName;
					const level = body.level;
					const xp = body.xp;
					const gro = body.gro;
					const star = body.star; // Added star
					const currentLand = body.current_land || body.currentLand;
					const inventory = body.inventory;
					const gameData = body.game_data || body.gameData;
					const createdAt = body.created_at || body.createdAt;

					// --- Security Validation Start ---
					const MAX_GRO_DELTA = 3000; // Max Gro gain allowed per sync (15 min)
					const MAX_XP_DELTA = 1000;  // Max XP gain allowed per sync (15 min)

					// 1. Basic Sanity Checks
					if (typeof gro !== 'number' || gro < 0) {
						return new Response(JSON.stringify({ error: 'Invalid Gro value' }), { status: 400, headers: corsHeaders });
					}
					if (typeof xp !== 'number' || xp < 0) {
						return new Response(JSON.stringify({ error: 'Invalid XP value' }), { status: 400, headers: corsHeaders });
					}

					// 2. Read-Before-Write checking
					const currentStmt = env.DB.prepare('SELECT gro, xp FROM users WHERE uid = ?').bind(uid);
					const currentData = await currentStmt.first();

					if (currentData) {
						// Existing User: Check Deltas
						const deltaGro = gro - currentData.gro;
						const deltaXp = xp - currentData.xp;

						// Allow negative delta (spending/loss) but check positive delta (gain)
						if (deltaGro > MAX_GRO_DELTA) {
							console.warn(`[Security] Gro Delta Exceeded: User ${uid} tried to add ${deltaGro} Gro (Max: ${MAX_GRO_DELTA})`);
							return new Response(JSON.stringify({ error: 'Security Alert: Abnormal currency gain detected.' }), {
								status: 400,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}

						if (deltaXp > MAX_XP_DELTA) {
							console.warn(`[Security] XP Delta Exceeded: User ${uid} tried to add ${deltaXp} XP (Max: ${MAX_XP_DELTA})`);
							return new Response(JSON.stringify({ error: 'Security Alert: Abnormal XP gain detected.' }), {
								status: 400,
								headers: { ...corsHeaders, 'Content-Type': 'application/json' }
							});
						}

					} else {
						// New User: Check if initial values are reasonable
						if (gro > 10000) { // Initial max including welcome gift
							return new Response(JSON.stringify({ error: 'Security Alert: Invalid initial Gro value.' }), { status: 400, headers: corsHeaders });
						}
					}
					// --- Security Validation End ---

					// Use current timestamp for sync time
					const now = Date.now();

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
						level || 1,
						xp || 0,
						gro || 0,
						star || 0,
						currentLand || 'default_ground',
						JSON.stringify(inventory || []),
						typeof gameData === 'string' ? gameData : JSON.stringify(gameData || {}),
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
