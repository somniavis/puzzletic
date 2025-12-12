/**
 * Cloudflare Worker for Grogrojello
 * Handles sync between Client and D1 Database
 */

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
			const uid = path.split('/').pop();
			if (!uid) return new Response('Missing UID', { status: 400, headers: corsHeaders });

			// GET: Retrieve User Data
			if (request.method === 'GET') {
				try {
					// Binding name matches what triggered in creating DB, likely 'grogrojello_db' or 'DB'
					// We set it to 'DB' in previous step via cli input
					const stmt = env.DB.prepare('SELECT * FROM users WHERE uid = ?').bind(uid);
					const result = await stmt.first();

					if (!result) {
						return new Response(JSON.stringify({ found: false }), {
							headers: { ...corsHeaders, 'Content-Type': 'application/json' }
						});
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
				try {
					const body = await request.json();
					const { email, displayName, level, xp, gro, currentLand, inventory, gameData, createdAt } = body;

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
            INSERT INTO users (uid, email, display_name, level, xp, gro, current_land, inventory, game_data, created_at, last_synced_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET
              email = excluded.email,
              display_name = excluded.display_name,
              level = excluded.level,
              xp = excluded.xp,
              gro = excluded.gro,
              current_land = excluded.current_land,
              inventory = excluded.inventory,
              game_data = excluded.game_data,
              last_synced_at = excluded.last_synced_at
          `).bind(
						uid,
						email,
						displayName,
						level || 1,
						xp || 0,
						gro || 0,
						currentLand || 'default_ground',
						JSON.stringify(inventory || []),
						JSON.stringify(gameData || {}),
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
